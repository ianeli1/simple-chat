import React, { Component, createContext } from "react";
import { Handler, ServerObject } from "../handler2";

export interface Context {
  user: User | null;
  lastServer: string | null;
  lastChannel: ChannelTuple | null; //tuple or null
  servers: {
    [key: string]: {
      data: ServerData;
      members: {
        [key: string]: User;
      };
      channels: {
        [key: string]: Channel;
      };
    };
  };
  globalEmotes: {
    //all emotes objects from each servers are stored here
    [key: string]: Emotes;
  };
}

const INITIAL_STATE: Context = {
  user: null,
  lastChannel: null,
  lastServer: null,
  servers: {},
  globalEmotes: {},
};

export interface Functions {
  addEmote(serverId: string, emoteName: string, emote: File): void;
  sendMessage(
    serverId: string,
    channel: string,
    msg: Message,
    file?: File | undefined
  ): void;
  loadServer(serverId: string): boolean;
  createChannel(channelName: string, serverId: string): void;
  createServer: (serverName: string) => void;
  joinServer: (serverId: string) => void;
  getChannel(serverId: string, channel: string): void;
  signIn: (email: string, pass: string, callback: (x: string) => void) => void;
  signOut: () => void;
  createUser: (
    username: string,
    email: string,
    pass: string,
    callback: (x: string) => void
  ) => void;
}

export const context = createContext<{ state: Context; functions: Functions }>(
  undefined!
);

export class ContextProvider extends Component<{}, Context> {
  handler: Handler;
  servers: {
    [key: string]: ServerObject;
  };
  constructor() {
    super({});
    this.state = INITIAL_STATE;
    this.handler = new Handler();
    this.handler.getUser((user) => void this.setState({ user }));
    this.servers = {};
    this.sendMessage = this.sendMessage.bind(this);
    this.getChannel = this.getChannel.bind(this);
    this.loadServer = this.loadServer.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.createServer = this.createServer.bind(this);
    this.joinServer = this.joinServer.bind(this);
    this.addEmote = this.addEmote.bind(this);

    /*
    this.setUser = this.setUser.bind(this);
    this.addServer = this.addServer.bind(this);
    this.functions = {
      setUser: this.setUser,
      addServer: this.addServer,
    };*/
  }

  joinServer(serverId: string) {
    //todo: update the ui
    this.handler.joinServer(serverId);
  }

  createChannel(channelName: string, serverId: string) {
    //ui updates itself?
    if (this.state.user?.servers?.includes(serverId)) {
      if (!Object.keys(this.servers).includes(serverId)) {
        this.loadServer(serverId);
      }
      this.servers[serverId].createChannel(channelName, this.state.user);
    } else {
      //TODO: better error reporting?
      console.log(
        `This user is not allowed to create the channel "${channelName}" in the server "${serverId}"`
      );
    }
  }

  createServer(serverName: string) {
    this.handler.createServer(serverName);
  }

  createUser(
    username: string,
    email: string,
    pass: string,
    callback: (x: string) => void
  ) {
    //is the callback needed?
    this.handler.createUser(username, email, pass, callback);
  }

  signIn(email: string, pass: string, callback: (x: string) => void) {
    //manage the callback internally?
    this.handler.signIn(email, pass, callback);
  }

  signOut() {
    //delete everything and show login screen
    this.handler.signOut();
  }

  /**
   * Adds a new emote to the current server
   * @param serverId The server to which the emote will be added
   * @param emoteName The emote's name
   * @param emote The image file
   */
  addEmote(serverId: string, emoteName: string, emote: File) {
    if (Object.keys(this.servers).includes(serverId)) {
      this.servers[serverId].addEmote(emoteName, emote);
    } else {
      if (this.loadServer(serverId)) {
        this.servers[serverId].addEmote(emoteName, emote);
      } else {
        console.log(
          `Error, couldn't add the emote "${emoteName}" to "${serverId}"`
        );
      }
    }
  }

  updateMembers(members: { [key: string]: User }, serverId: string) {
    this.setState((state) => ({
      servers: {
        ...state.servers,
        [serverId]: {
          ...state.servers[serverId],
          members,
        },
      },
    }));
  }

  updateData(data: ServerData, serverId: string) {
    this.setState((state) => ({
      servers: {
        ...state.servers,
        [serverId]: {
          ...state.servers[serverId],
          data,
        },
      },
      globalEmotes: {
        [serverId]: data.emotes || {},
      },
    }));
  }

  /**
   * Loads a new server into memory
   * @param serverId The ID of the server to be loaded
   * @example
   * functions.loadServer("123")
   */
  loadServer(serverId: string): boolean {
    //TODO: disable the detachment feature in handler2 as it's no longer needed
    if (this.state.user?.servers?.includes(serverId)) {
      if (!Object.keys(this.servers).includes(serverId)) {
        //TODO: implement a server stack, limit
        this.servers[serverId] = new ServerObject(serverId);
        this.servers[serverId].initialize(
          (members) => this.updateMembers(members, serverId),
          (data) => this.updateData(data, serverId)
        );
      }
      this.setState({ lastServer: serverId, lastChannel: null }); //loading a server should not reset the chatbox //timing issue?
      /*
      if (this.servers[serverId].data?.channels[0]) {
        console.log(`First channel: ${this.servers[serverId].data?.channels}`);
        this.getChannel(serverId, this.servers[serverId].data?.channels[0]);
      }*/ return true;
    } else {
      console.log(
        `This user doesn't have permission to load the server "${serverId}"`
      );
      return false;
    }
  }

  updateChannel(serverId: string, channel: string, channelObj: Channel) {
    this.setState(
      (state) =>
        (state.lastServer && {
          servers: {
            [state.lastServer]: {
              ...state.servers[state.lastServer],
              channels: {
                ...state.servers[state.lastServer].channels,
                [channel]: channelObj,
              },
            },
          },
        }) ||
        null
    );
  }

  /**
   * Loads a new channel into memory
   * @param serverId The server id that owns the channel
   * @param channel The channel's name
   *
   * @example
   * handler.getChannel("coolServer", "coolChannel")
   *
   */
  getChannel(serverId: string, channel: string) {
    //disable detachment

    if (this.state.user) {
      if (!Object.keys(this.servers).includes(serverId)) {
        if (
          this.loadServer(serverId) &&
          this.state.servers[serverId]?.data?.channels.includes(channel)
        ) {
          this.servers[serverId].getChannel(channel, (channelObj) =>
            this.updateChannel(serverId, channel, channelObj)
          );
        } else {
          console.log(
            `An error ocurred while getting the channel "${channel}" in "${serverId}"`
          );
        }
      } else {
        this.servers[serverId].getChannel(channel, (channelObj) =>
          this.updateChannel(serverId, channel, channelObj)
        );
      }
    } else {
      console.log(
        `Couldn't get the channel "${channel}", user is NOT logged in.`
      );
    }
    this.setState({ lastChannel: { server: serverId, channel: channel } });
  }

  sendMessage(serverId: string, channel: string, msg: Message, file?: File) {
    //am i making too many checks?
    if (Object.keys(this.servers).includes(serverId)) {
      const thisServer = this.servers[serverId];
      if (Object.keys(this.servers[serverId].channels).includes(channel)) {
        this.servers[serverId].channels[channel].sendMessage(msg, file);
      }
    } else {
      if (
        this.loadServer(serverId) &&
        this.state.servers[serverId]?.data?.channels.includes(serverId)
      ) {
        this.servers[serverId].channels[channel].sendMessage(msg, file);
      }
    }
  }

  render() {
    const functions = {
      addEmote: this.addEmote,
      sendMessage: this.sendMessage,
      loadServer: this.loadServer,
      createChannel: this.createChannel,
      createServer: this.createServer,
      joinServer: this.joinServer,
      getChannel: this.getChannel,
      signIn: this.signIn,
      signOut: this.signOut,
      createUser: this.createUser,
    };
    return (
      <context.Provider value={{ state: this.state, functions }}>
        {this.props.children}
      </context.Provider>
    );
  }
}
