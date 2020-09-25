import React, { useContext } from "react";
import { ChannelList } from "../components/ChannelList";
import { context } from "../components/ContextProvider";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
};

export default function LeftSidebar(props: LeftSidebarProps) {
  const { state, functions } = useContext(context);
  const channelList = state.currentServer
    ? state.servers[state.currentServer]?.data?.channels || []
    : [];
  return (
    state.user && (
      <div id="LeftSidebar">
        {state.user.servers && (
          <ServerList
            serverList={state.user.servers}
            changeServer={functions.loadServer}
            createServer={functions.createServer}
          />
        )}
        {state.currentServer && (
          <ChannelList
            currentChannel={state.currentChannel}
            channelList={channelList}
            changeChannel={(channel) => functions.getChannel(channel)}
            user={state.user}
            createChannel={(channel) => functions.createChannel(channel)}
            openWindow={props.openWindow}
          />
        )}
      </div>
    )
  );
}
