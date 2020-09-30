import React, { useCallback, useState } from "react";
import { useChannel, useServer, useUser } from "../dataHandler/hooks";
import { Confirm, ConfirmProps } from "./Confirm";
import { ImageSelector, ISProps } from "./ImageSelector";
import { TDProps, TextDialog } from "./TextDialog";

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

interface ImageSelectFunc {
  (
    title: string,
    text: string,
    onPositive: (name: string, fileUrl: string) => void | Promise<void>,
    isEmote?: boolean,
    textAfter?: string
  ): void;
}

interface TextDialogFunc {
  (title: string, text: string, onPositive: (text: string) => void): void;
}

export const menuContext = React.createContext<{
  confirm: ConfirmFunction;
  imageSelect: ImageSelectFunc;
  textDialog: TextDialogFunc;
}>(undefined!);

export function Intermediary(props: { children: React.ReactNode }) {
  const textDialog: TextDialogFunc = useCallback(function (
    title,
    text,
    onPositive
  ) {
    setTextDialogState({
      close: () => setShowTextDialog(false),
      onPositive,
      text,
      title,
    });
    setShowTextDialog(true);
  },
  []);

  const confirm: ConfirmFunction = useCallback(function (
    title,
    text,
    onPositive,
    onNegative
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

  const imageSelect: ImageSelectFunc = useCallback(function (
    title,
    text,
    onPositive,
    isEmote,
    textAfter
  ) {
    setImageSelectorProps({
      close: () => setShowImageSelector(false),
      onPositive,
      text,
      title,
      isEmote,
      textAfter,
    });
    setShowImageSelector(true);
  },
  []);

  const [imageSelectorProps, setImageSelectorProps] = useState<
    Omit<ISProps, "open">
  >({
    close: () => setShowImageSelector(false),
    onPositive: () => void null,
    text: "",
    title: "",
  });

  const [confirmState, setConfirmState] = useState<
    Omit<ConfirmProps, "open"> | undefined
  >(undefined);

  const [textDialogState, setTextDialogState] = useState<Omit<TDProps, "open">>(
    {
      close: () => setShowTextDialog(false),
      onPositive: () => void null,
      text: "",
      title: "",
    }
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);

  const [currentServer, setCurrentServer] = useState<null | string>(null);
  const [currentChannel, setCurrentChannel] = useState<null | string>(null);

  const userObj = useUser();
  const serverObj = useServer(currentServer || undefined);
  const channelObj = useChannel(
    currentServer || undefined,
    currentChannel || undefined
  );

  return (
    <serverContext.Provider value={serverObj}>
      <channelContext.Provider value={channelObj}>
        <userContext.Provider value={userObj}>
          <currentContext.Provider
            value={{
              currentChannel,
              currentServer,
              setCurrentChannel,
              setCurrentServer,
            }}
          >
            <TextDialog open={showTextDialog} {...textDialogState} />
            <ImageSelector open={showImageSelector} {...imageSelectorProps} />
            <Confirm open={showConfirm} {...confirmState} />
            <menuContext.Provider value={{ confirm, imageSelect, textDialog }}>
              {props.children}
            </menuContext.Provider>
          </currentContext.Provider>
        </userContext.Provider>
      </channelContext.Provider>
    </serverContext.Provider>
  );
}
