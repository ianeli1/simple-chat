import React, { useCallback, useContext, useEffect, useState } from "react";
import { ChannelList } from "../components/ChannelList";
import {
  createChannel,
  createServer,
  dataContext,
  getChannel,
  loadServer,
  MiscACT,
} from "../components/Intermediary";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
};

function useLeftSidebar() {
  const [state, dispatch] = useContext(dataContext);
  const [user, setUser] = useState<User | null>(null);
  const [currentServer, setCurrentServer] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [channelList, setChannelList] = useState<string[]>([]);
  const curr = state.misc.currentServer;
  useEffect(() => {
    const curr = state.misc.user;
    if (curr) {
      setUser(curr);
    } else {
      setUser(null);
    }
  }, [state.misc.user]);

  useEffect(() => {
    if (curr) {
      if (state.servers[curr]?.data) {
        setChannelList(state.servers[curr].data.channels);
      }
      setCurrentServer(curr);
      setCurrentChannel(null);
    } else {
      setChannelList([]);
      setCurrentChannel(null);
      setCurrentServer(null);
    }
  }, [state.servers[curr || ""]]);

  useEffect(() => {
    const server = state.misc.currentServer;
    const channel = state.misc.currentChannel;
    if (server && channel) {
      setCurrentChannel(channel);
      setCurrentServer(server);
    } else {
      setCurrentChannel(null);
    }
  }, [state.misc.currentChannel]);

  const goHome = useCallback(
    () => dispatch({ type: MiscACT.SET_CURRENT_SERVER, current: null }),
    []
  );

  return { user, currentServer, currentChannel, channelList, goHome };
}

export default function LeftSidebar(props: LeftSidebarProps) {
  const {
    user,
    currentServer,
    currentChannel,
    channelList,
    goHome,
  } = useLeftSidebar();
  return (
    user && (
      <div id="LeftSidebar">
        {user.servers && (
          <ServerList
            serverList={user.servers}
            changeServer={loadServer}
            createServer={createServer}
            goHome={goHome}
          />
        )}
        <ChannelList
          currentChannel={currentChannel}
          channelList={channelList || []}
          changeChannel={(channel) => getChannel(channel)}
          user={user}
          createChannel={(channel) => createChannel(channel)}
          openWindow={props.openWindow}
        />
      </div>
    )
  );
}
