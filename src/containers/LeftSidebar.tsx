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
  menuContext,
  serverContext,
  userContext,
} from "../components/Intermediary";
import { ProfileFooter } from "../components/ProfileFooter";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";
import { Settings } from "./Settings";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
};

export default function LeftSidebar(props: LeftSidebarProps) {
  const {
    currentChannel,
    setCurrentChannel,
    setCurrentServer,
    currentServer,
  } = useContext(currentContext);
  const { serverData } = useContext(serverContext);
  const { user, createServer } = useContext(userContext);
  const [showSettings, setShowSettings] = useState(false);
  function goHome() {
    setCurrentChannel(null);
    setCurrentServer(null);
  }

  function handleServerChange(serverId: string) {
    setCurrentChannel(null);
    setCurrentServer(serverId);
  }

  return (
    <section id="LeftSidebarRoot">
      <Settings isOpen={showSettings} close={() => setShowSettings(false)} />
      <div id="LeftSidebar">
        {user && (
          <ServerList
            serverList={user.servers || []}
            changeServer={handleServerChange}
            createServer={(serverName) =>
              createServer && createServer(serverName)
            }
            goHome={goHome}
          />
        )}
        <ChannelList
          currentChannel={currentChannel}
          channelList={currentServer && serverData ? serverData?.channels : []}
          changeChannel={setCurrentChannel}
          openWindow={props.openWindow}
        />
      </div>
      <ProfileFooter onSettings={() => setShowSettings(true)} />
    </section>
  );
}
