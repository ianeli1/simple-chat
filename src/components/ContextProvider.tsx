import React, { Component, createContext } from "react";
import { Handler } from "../handler2";

interface Context {
  user: User | null;
  currentServer: string | null;
  currentChannel: string | null;
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
  currentChannel: null,
  currentServer: null,
  servers: {},
  globalEmotes: {},
};

export interface Functions {
  addEmote: (emoteName: string, emote: File) => void;
  sendMessage: (msg: Message, file?: File | undefined) => void;
  loadServer: (id: string) => void;
  createChannel: (channelName: string) => void;
  createServer: (serverName: string) => void;
  joinServer: (serverId: string) => void;
  getChannel: (channel: string) => void;
}

export const context = createContext<{ state: Context; functions: Functions }>(
  undefined!
);

export class ContextProvider extends Component<{}, Context> {
  handler: Handler;
  constructor() {
    super({});
    this.state = INITIAL_STATE;
    this.handler = new Handler();
    this.handler.getUser((user) => void this.setState({ user }));
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

  createChannel(channelName: string) {
    //ui updates itself?
    this.handler.createChannel(channelName);
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

  addEmote(emoteName: string, emote: File) {
    //specify where?
    this.handler.addEmote(emoteName, emote);
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

  loadServer(id: string) {
    //TODO: disable the detachment feature in handler2 as it's no longer needed
    this.handler.loadServer(
      id,
      (members) => this.updateMembers(members, id),
      (data) => this.updateData(data, id)
    );
  }

  getCurrentServer() {
    return this.handler.currentServer;
  }

  setCurrentServer(id: string) {
    this.loadServer(id);
  }

  getChannel(channel: string) {
    //disable detachment
    this.state.currentServer &&
      this.handler.getChannel(channel, (channelObj) =>
        this.setState(
          (state) =>
            (state.currentServer && {
              servers: {
                [state.currentServer]: {
                  ...state.servers[state.currentServer],
                  channels: {
                    ...state.servers[state.currentServer].channels,
                    [channel]: channelObj,
                  },
                },
              },
            }) ||
            null
        )
      ); //don't update state if there's no currentserver selected
  }

  sendMessage(msg: Message, file?: File) {
    this.handler.sendMessage(msg, file);
  }

  /*
  addChannel(channel: Channel, serverId: string, id: string) {
    this.setState((state) => ({
      currentServer: serverId,
      currentChannel: id,
      servers: {
        ...state.servers,
        [serverId]: {
          ...state.servers[serverId],
          channels: {
            ...state.servers[serverId].channels,
            [id]: channel,
          },
        },
      },
    }));
  }
  */
  render() {
    const functions = {
      addEmote: this.addEmote,
      sendMessage: this.sendMessage,
      loadServer: this.loadServer,
      createChannel: this.createChannel,
      createServer: this.createServer,
      joinServer: this.joinServer,
      getChannel: this.getChannel,
    };
    return (
      <context.Provider value={{ state: this.state, functions }}>
        {this.props.children}
      </context.Provider>
    );
  }
}

/*
const reducer = (state: Context, action: Action): Context => {
    switch(action.type){
        case ACT.SET_USER:
            if(action.user){
                return {...state, user: action.user}
            }else{
                return state
            }
        case ACT.ADD_SERVER:
            if(action.id && action.server){
                return {...state, 
                    currentServer: action.id,
                    servers: {
                        ...state.servers,
                        [action.id]:{
                            data: action.server,
                            channels: {}
                        } 
                    }
                }
            }else return state
        case ACT.ADD_CHANNEL:
            if(action.id && action.id2 && action.channel){ //id=serverName, id2=channelName
                return {...state,
                    currentServer: action.id,
                    currentChannel: action.id2,
                    servers: {
                        ...state.servers,
                        [action.id]: {
                            ...state.servers[action.id],
                            channels: {
                                ...state.servers[action.id].channels,
                                [action.id2]: action.channel
                            }
                        }
                    }
                }
            }else return state
        default:
            throw Error("Context Error:"+action.type||"unknown"+" is not a valid action type")
            
    }
}*/
