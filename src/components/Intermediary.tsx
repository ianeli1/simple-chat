import React, { useCallback, useState } from "react";
import { useChannel, useServer, useUser } from "../dataHandler/hooks";
import { Confirm, ConfirmProps } from "./Confirm";

export const serverContext = React.createContext<ReturnType<typeof useServer>>(
  undefined!
);
export const channelContext = React.createContext<
  ReturnType<typeof useChannel>
>(undefined!);
export const userContext = React.createContext<ReturnType<typeof useUser>>(
  undefined!
);
export const currentContext = React.createContext<{
  currentServer: string | null;
  currentChannel: string | null;
  setCurrentServer: (serverId: string | null) => void;
  setCurrentChannel: (channelName: string | null) => void;
}>(undefined!);

interface ConfirmFunction {
  (
    title: string,
    text: string,
    onPositive: () => void,
    onNegative?: () => void
  ): void;
}

export const confirmContext = React.createContext<ConfirmFunction>(undefined!);

export function Intermediary(props: { children: React.ReactNode }) {
  const confirm: ConfirmFunction = useCallback(function (
    title: string,
    text: string | null,
    onPositive: () => void,
    onNegative?: () => void
  ) {
    setConfirmState({
      title,
      text: text || "",
      onPositive: () => {
        onPositive();
        setShowConfirm(false);
      },
      onNegative: () => {
        onNegative && onNegative();
        setShowConfirm(false);
      },
    });
    setShowConfirm(true);
  },
  []);

  const [showConfirm, setShowConfirm] = useState(false);
  const [currentServer, setCurrentServer] = useState<null | string>(null);
  const [currentChannel, setCurrentChannel] = useState<null | string>(null);
  const [confirmState, setConfirmState] = useState<
    Omit<ConfirmProps, "open"> | undefined
  >(undefined);
  const {
    createServer,
    friendFunctions,
    joinServer,
    leaveServer,
    user,
  } = useUser();
  const serverObj = useServer(currentServer || undefined);
  const { channel, sendMessage } = useChannel(
    currentServer || undefined,
    currentChannel || undefined
  );

  return (
    <serverContext.Provider value={serverObj}>
      <channelContext.Provider value={{ channel, sendMessage }}>
        <userContext.Provider
          value={{
            createServer,
            friendFunctions,
            joinServer,
            leaveServer,
            user,
          }}
        >
          <currentContext.Provider
            value={{
              currentChannel,
              currentServer,
              setCurrentChannel,
              setCurrentServer,
            }}
          >
            <Confirm open={showConfirm} {...confirmState} />
            <confirmContext.Provider value={confirm}>
              {props.children}
            </confirmContext.Provider>
          </currentContext.Provider>
        </userContext.Provider>
      </channelContext.Provider>
    </serverContext.Provider>
  );
}
