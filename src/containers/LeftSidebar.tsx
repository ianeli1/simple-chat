import React, { useCallback, useContext, useEffect, useState } from "react";
import { ChannelList } from "../components/ChannelList";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
  currentServer: string | null;
  currentChannel: string | null;
  setCurrentServer: (idk: string | null) => void;
  setCurrentChannel: (idk: string | null) => void;
  serverList: string[] | null;
  channelList: string[] | null;
  createChannel: ((channel: string) => void) | null;
  createServer: ((serverName: string) => void) | null;
};

export default function LeftSidebar(props: LeftSidebarProps) {
  function goHome() {
    props.setCurrentChannel(null);
    props.setCurrentServer(null);
  }
  return (
    <div id="LeftSidebar">
      {props.serverList && (
        <ServerList
          serverList={props.serverList}
          changeServer={props.setCurrentServer}
          createServer={(serverName) =>
            props.createServer && props.createServer(serverName)
          }
          goHome={goHome}
        />
      )}
      <ChannelList
        currentChannel={props.currentChannel}
        channelList={props.channelList || []}
        changeChannel={props.setCurrentChannel}
        createChannel={(channel) =>
          props.createChannel && props.createChannel(channel)
        }
        openWindow={props.openWindow}
      />
    </div>
  );
}
