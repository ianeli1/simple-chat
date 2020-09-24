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
  const channelList = state.lastServer
    ? state.servers[state.lastServer]?.data?.channels || []
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
        {state.lastServer && (
          <ChannelList
            currentChannel={
              state.lastChannel ? state.lastChannel.channel : null
            }
            channelList={channelList}
            changeChannel={(channel) =>
              state.lastServer &&
              functions.getChannel(state.lastServer, channel)
            }
            user={state.user}
            createChannel={(channel) =>
              state.lastServer &&
              functions.createChannel(channel, state.lastServer)
            }
            openWindow={props.openWindow}
          />
        )}
      </div>
    )
  );
}
