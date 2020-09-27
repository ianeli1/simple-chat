import React, { useContext, useEffect, useState } from "react";
import { ChannelList } from "../components/ChannelList";
import {
  createChannel,
  createServer,
  dataContext,
  getChannel,
  loadServer,
} from "../components/Intermediary";
import { ServerList } from "../components/ServerList";
import "../css/leftSidebar.css";

type LeftSidebarProps = {
  openWindow: (window: string) => void;
};

function waitFor<A, B extends keyof A>(
  obj: A,
  prop: B,
  timeout: number
): Promise<A[B]> {
  if (!obj) return Promise.reject(new TypeError("waitFor expects an object"));
  const expected = Boolean;
  var value = obj[prop];
  if (expected(value)) return Promise.resolve(value);
  let timeoutObj: NodeJS.Timeout;
  return new Promise(function (resolve, reject) {
    if (timeout)
      timeoutObj = setTimeout(function () {
        Object.defineProperty(obj, prop, { value: value, writable: true });
        reject(new Error(`Function timed out waiting for ${prop}`));
      }, timeout);
    Object.defineProperty(obj, prop, {
      enumerable: true,
      configurable: true,
      get: function () {
        return value;
      },
      set: function (v) {
        if (expected(v)) {
          if (timeout) clearTimeout(timeoutObj);
          Object.defineProperty(obj, prop, { value: v, writable: true });
          resolve(v);
        } else {
          value = v;
        }
      },
    });
  });
  // could be shortened a bit using "native" .finally and .timeout Promise methods
}

function useLeftSidebar() {
  const [state] = useContext(dataContext);
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

  return { user, currentServer, currentChannel, channelList };
}

export default function LeftSidebar(props: LeftSidebarProps) {
  const { user, currentServer, currentChannel, channelList } = useLeftSidebar();
  return (
    user && (
      <div id="LeftSidebar">
        {user.servers && (
          <ServerList
            serverList={user.servers}
            changeServer={loadServer}
            createServer={createServer}
          />
        )}
        {currentServer && (
          <ChannelList
            currentChannel={currentChannel}
            channelList={channelList}
            changeChannel={(channel) => getChannel(channel)}
            user={user}
            createChannel={(channel) => createChannel(channel)}
            openWindow={props.openWindow}
          />
        )}
      </div>
    )
  );
}
