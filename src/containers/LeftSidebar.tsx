import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChannelList } from "../components/ChannelList";
import {
  currentContext,
  serverContext,
  userContext,
} from "../components/Intermediary";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
};

export default function LeftSidebar(props: LeftSidebarProps) {
  const { currentChannel, setCurrentChannel, setCurrentServer } = useContext(
    currentContext
  );
  const { serverData, createChannel } = useContext(serverContext);
  const { user, createServer } = useContext(userContext);
  function goHome() {
    setCurrentChannel(null);
    setCurrentServer(null);
  }
  return useMemo(
    () => (
      <section id="LeftSidebarRoot">
        <div id="LeftSidebar">
          {user && (
            <ServerList
              serverList={user.servers || []}
              changeServer={setCurrentServer}
              createServer={(serverName) =>
                createServer && createServer(serverName)
              }
              goHome={goHome}
            />
          )}
          <ChannelList
            currentChannel={currentChannel}
            channelList={serverData?.channels || []}
            changeChannel={setCurrentChannel}
            createChannel={(channel) => createChannel && createChannel(channel)}
            openWindow={props.openWindow}
          />
        </div>
      </section>
    ),
    [user?.servers, serverData?.channels]
  );
}
