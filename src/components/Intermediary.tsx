import React, { useState } from "react";
import { useChannel, useServer, useUser } from "../dataHandler/hooks";

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

export function Intermediary(props: { children: React.ReactNode }) {
  const [currentServer, setCurrentServer] = useState<null | string>(null);
  const [currentChannel, setCurrentChannel] = useState<null | string>(null);
  const { createServer, friendFunctions, joinServer, user } = useUser();
  const { addEmote, createChannel, serverData } = useServer(
    currentServer || undefined
  );
  const { channel, sendMessage } = useChannel(
    currentServer || undefined,
    currentChannel || undefined
  );

  return (
    <serverContext.Provider value={{ addEmote, createChannel, serverData }}>
      <channelContext.Provider value={{ channel, sendMessage }}>
        <userContext.Provider
          value={{ createServer, friendFunctions, joinServer, user }}
        >
          <currentContext.Provider
            value={{
              currentChannel,
              currentServer,
              setCurrentChannel,
              setCurrentServer,
            }}
          >
            {props.children}
          </currentContext.Provider>
        </userContext.Provider>
      </channelContext.Provider>
    </serverContext.Provider>
  );
}
