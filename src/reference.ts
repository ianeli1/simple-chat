/*
users {
    "userId": { //User object
        name: string,
        icon?: "iconId",
        status?:
        servers: ["serverId1"...]
    }
}

servers {
    "serverId": { 
        data: {
            name: "Name of the server",
            icon: "iconId"
            owner: "userId of the owner",
            typing: ["user1", "user2"...],
            channels: ["channel1", "channel2"]
            emotes: {
                "nameOfEmote.extension": "downloadUrl"
            }
        },
        members: {
            "userId": { //User object
                name: "Name of the user",
                icon: "userIcon",
                status: "whatever"
            }
        }
        channels: {
            "channel": { //Channel object
                "timestamp"+"[0-9]": { //Message Object

                }
            }
        }
    }
}

When a message contains emotes it will include the
name of the emote in this format: <:EmoteName:>
and in the message object will be the dictionary incluiding
the used emotes

implement redux! NO! let's use context + hooks
all emotes should be stored in their store
users too!
servers!

*/
export declare class Handler {
  user: User | null;
  currentServer: string;

  constructor();

  /**
   * Joins the provided server
   * @param serverId The ID of the server
   * @todo Check if the server actually exists
   */
  public joinServer(serverId: string): void;

  /**
   * Creates a new channel in the current server
   * @param channelName The channel's name
   */
  createChannel(channelName: string): void;

  /**
   * Creates a new server
   * @description
   * The user *must* be signed in
   * @param serverName The name of the server
   */
  createServer(serverName: string): void;

  /**
   * Attempts to log the user in.
   * @param email The email of the user, correctly formatted
   * @param pass A password
   * @param callback A callback function if there's any problem while creating the user
   * - `callback("password")` if it's related to the password provided.
   * - `callback("email")` if it's related to the email.
   */
  signIn(email: string, pass: string, callback: (x: string) => void): void;

  /**
   * Creates a new user with the provided credentials
   * @param username The name of the user
   * @param email The email of the user, correctly formatted
   * @param pass A password
   * @param callback A callback function if there's any problem while creating the user
   * - `callback("password")` if it's related to the password provided.
   * - `callback("email")` if it's related to the email.
   *
   */
  createUser(
    username: string,
    email: string,
    pass: string,
    callback: (x: string) => void
  ): void;

  /**
   * Logs out the current user
   */
  signOut(): void;

  /**
   * Initializes the Firebase Auth listener. If there's an user logged in via Firebase, `handler.initialize` will be called
   * @param updateUser A function pointing to a React setState
   * @example
   * handler.getUser((user) => this.setState({user}))
   */
  getUser(updateUser: (user: User | null) => void): void;

  /**
   * Initializes the listener for the current user's data.
   * `handler.getUser()` calls this method after a succesful login
   * @param updateUser A function pointing to a React setState
   * @example
   * handler.initialize((user) => this.setState({user}))
   */
  initialize(updateUser: (user: User) => void): void;

  /**
   * Loads a new server into memory
   * @param serverId The ID of the server to be loaded
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   * @example
   * handler.loadServer("123", (members) => this.setState({members})
   *                    (data) => this.setState({data}))
   */
  loadServer(serverId: string, update?: boolean): void;

  /**
   * Adds a new emote to the current server
   * @param emoteName The emote's name
   * @param emote The image file
   */
  addEmote(emoteName: string, emote: File): void;

  /**
   * [***For debug only***] Returns *all* the data saved in this object
   */
  getDebug(): void;

  /**
   * Loads a new channel into memory
   * @param channel The channel's name
   * @param updateChannel A function pointing to a React setState
   *
   * @example
   * handler.getChannel("coolChannel", (channel: Channel) => this.setState({channel}))
   *
   * @todo Prevent it from loading a non-existant channel
   */
  getChannel(channel: string, updateChannel: (channel: Channel) => void): void;

  /**
   * Sends a new message to the specified channel
   * @param msg The message object to be sent, must be in the Message format
   * @param file [*Optional*] An image file to be sent with the message
   *
   * @todo Use the `this.user` object and not trust the UI
   */
  sendMessage(msg: Message, file?: File): void;
}

declare global {
  interface User {
    name: string;
    userId: string;
    icon: string | null;
    status?: "online" | "idle" | "dnd" | "offline"; //add invisible?
    servers?: string[];
    friends?: string[];
    friendReq?: {
      [userId: string]: string | number;
    };
  }

  interface Channel {
    [key: string]: Message;
  }

  interface Invite {
    id: string;
    name: string;
    icon?: string; //TODO: add icon support
  }

  interface Message {
    name: string;
    userId?: string;
    message: string;
    image?: string;
    timestamp: firebase.firestore.Timestamp;
    emotes?: {
      [key: string]: string;
    };
    invite?: Invite;
  }

  interface Emotes {
    [key: string]: string;
  }

  interface ServerData {
    id: string;
    channels: string[];
    name: string;
    icon?: string;
    ownerId: string;
    typing?: {
      [key: string]: string;
    };
    emotes?: {
      [key: string]: string;
    };
  }

  interface Reference {
    db: firebase.database.Reference;
    storage: firebase.storage.Reference;
  }

  interface Data {
    [serverId: string]: {
      data: ServerData;
      members: {
        [userId: string]: User;
      };
      channels: {
        [channel: string]: Channel;
      };
    };
  }

  interface Action {
    type: number;
    serverId?: string;
    channelName?: string;
    data?: ServerData;
    members?: {
      [userId: string]: User;
    };
    channel?: Channel;
    user?: User;
    current?: string | null;
  }
}
