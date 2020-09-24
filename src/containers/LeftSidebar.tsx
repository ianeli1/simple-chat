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
  const channelList =
    (state.currentServer &&
      state.servers[state.currentServer] &&
      state.servers[state.currentServer].data &&
      state.servers[state.currentServer].data.channels) ||
    [];
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
        {
          <ChannelList
            currentChannel={state.currentChannel}
            channelList={channelList}
            changeChannel={functions.getChannel}
            user={state.user}
            createChannel={functions.createChannel}
            openWindow={props.openWindow}
          />
        }
      </div>
    )
  );
}
