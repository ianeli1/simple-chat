import * as firebase from "firebase";
import { firebaseConfig } from "./secretKey";
import * as r from "./reference";

firebase.initializeApp(firebaseConfig);

/**
 * ***The*** Handler
 * @description
 * Manages all of the behind the scenes connections to the database
 */
export class Handler implements r.Handler {
  user: User | null;
  servers: {
    [key: string]: ServerObject;
  };
  currentServer: string;
  private userRef: firebase.database.Reference;

  /**Creates a new ***The*** Handler object */
  constructor() {
    this.user = null;
    this.servers = {};
    this.currentServer = "";
    this.userRef = firebase.database().ref("users");
    this.sendMessage = this.sendMessage.bind(this);
    this.getChannel = this.getChannel.bind(this);
    this.getUser = this.getUser.bind(this);
    this.loadServer = this.loadServer.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.createServer = this.createServer.bind(this);
    this.joinServer = this.joinServer.bind(this);
    this.initialize = this.initialize.bind(this);
    this.getDebug = this.getDebug.bind(this);
    this.addEmote = this.addEmote.bind(this);
  }

  /**
   * Joins the provided server
   * @param serverId The ID of the server
   * @todo Check if the server actually exists
   */
  joinServer(serverId: string) {
    if (this.user) {
      const userNode = firebase
        .database()
        .ref("users/" + this.user.userId + "/servers")
        .push();
      userNode.set(serverId);
    }
  }

  /**
   * Creates a new channel in the current server
   * @param channelName The channel's name
   */
  createChannel(channelName: string) {
    this.user &&
      this.servers[this.currentServer].createChannel(channelName, this.user);
  }

  /**
   * Creates a new server
   * @description
   * The user *must* be signed in
   * @param serverName The name of the server
   */
  createServer(serverName: string) {
    //should this be handled by Cloud Fns?
    //use createChannel & joinServer
    const serverNode = firebase.database().ref("servers").push();
    const key = Date.now() + String(Math.floor(Math.random() * 9));
    if (this.user && serverNode.key) {
      let server: {
        data: ServerData;
        members: { [key: string]: User };
        channels: { [x: string]: Channel };
      } = {
        data: {
          id: serverNode.key,
          name: serverName,
          owner: this.user.userId,
          channels: ["123"],
        },
        members: {
          [this.user.userId]: this.user,
        },
        channels: {
          general: {
            [key]: {
              name: this.user.name,
              userId: this.user.userId,
              message: "[System]: " + this.user.name + " created the channel.",
              timestamp: key,
            },
          },
        },
      };
      serverNode.set(server);
      this.joinServer(serverNode.key);
    }
  }

  /**
   * Attempts to log the user in.
   * @param email The email of the user, correctly formatted
   * @param pass A password
   * @param callback A callback function if there's any problem while creating the user
   * - `callback("password")` if it's related to the password provided.
   * - `callback("email")` if it's related to the email.
   */
  signIn(email: string, pass: string, callback: (x: string) => void) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, pass)
      .catch((e) => {
        switch (e.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
            callback("email");
            break;
          case "auth/wrong-password":
            callback("password");
            break;
          default:
            console.error(e);
            break;
        }
      }); //TODO error callback?
  }

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
  ) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass)
      .then((user) => {
        if (user.user) {
          firebase
            .database()
            .ref("users/" + user.user.uid)
            .set({
              name: username,
              servers: ["123"],
            });
        }
      })
      .catch((e) => {
        switch (e.code) {
          case "auth/email-already-in-use":
          case "auth/invalid-email":
            callback("email");
            break;
          case "auth/weak-password":
            callback("password");
            break;
          default:
            console.log(
              "An unhandled error ocurred while creating a new user:",
              e
            );
        }
      });
  }

  /**
   * Logs out the current user
   */
  signOut() {
    firebase.auth().signOut();
  }

  /**
   * Initializes the Firebase Auth listener. If there's an user logged in via Firebase, `handler.initialize` will be called
   * @param updateUser A function pointing to a React setState
   * @example
   * handler.getUser((user) => this.setState({user}))
   */
  getUser(updateUser: (user: User | null) => void) {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const temp = await (
          await firebase
            .database()
            .ref("users/" + user.uid)
            .once("value")
        ).val();
        temp.userId = user.uid;
        temp.servers = Object.values(temp.servers);
        this.user = temp;
        console.log("Got user:", { user, userData: this.user });
        this.initialize(updateUser);
      } else {
        this.userRef.off();
        this.user = null;
      }
      updateUser(this.user);
    });
  }

  /**
   * Initializes the listener for the current user's data.
   * `handler.getUser()` calls this method after a succesful login
   * @param updateUser A function pointing to a React setState
   * @example
   * handler.initialize((user) => this.setState({user}))
   */
  initialize(updateUser: (user: User) => void) {
    if (this.user) {
      this.userRef
        .child(this.user.userId)
        .on("value", (snap: firebase.database.DataSnapshot) => {
          const temp = snap.val();
          this.user &&
            this.user.userId &&
            updateUser({
              ...this.user,
              ...temp,
              servers: Object.values(temp.servers),
            });
        });
      const onlineRef = firebase
        .database()
        .ref("users/" + this.user.userId + "/status");
      onlineRef.onDisconnect().set("offline");
      onlineRef.set("online");

      if (this.user.servers) {
        for (let elem of this.user.servers) {
          const tempRef = firebase
            .database()
            .ref(
              "servers/" + elem + "/members/" + this.user.userId + "/status"
            );
          tempRef.onDisconnect().set("offline");
          tempRef.parent && tempRef.parent.set(this.user);
          tempRef.set("online");
        }
      }
    }
  }

  /**
   * Loads a new server into memory
   * @param serverId The ID of the server to be loaded
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   * @example
   * handler.loadServer("123", (members) => this.setState({members})
   *                    (data) => this.setState({data}))
   */
  loadServer(
    serverId: string,
    updateMembers: (serverMembers: { [key: string]: User }) => void,
    updateData: (serverData: ServerData) => void
  ) {
    this.currentServer.length && this.servers[this.currentServer].detach();
    this.currentServer = serverId;
    if (Object.keys(this.servers).includes(serverId)) {
      this.servers[this.currentServer].attach(updateMembers, updateData);
    } else {
      this.servers[this.currentServer] = new ServerObject(serverId);
      this.servers[this.currentServer].initialize(updateMembers, updateData);
    }
  }

  /**
   * Adds a new emote to the current server
   * @param emoteName The emote's name
   * @param emote The image file
   */
  addEmote(emoteName: string, emote: File) {
    this.servers[this.currentServer].addEmote(emoteName, emote);
  }

  /**
   * [***For debug only***] Returns *all* the data saved in this object
   */
  getDebug() {
    this.servers[this.currentServer].getDebug();
  }

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
  getChannel(channel: string, updateChannel: (channel: Channel) => void) {
    this.servers[this.currentServer].getChannel(channel, updateChannel);
  }

  /**
   * Sends a new message to the specified channel
   * @param msg The message object to be sent, must be in the Message format
   * @param file [*Optional*] An image file to be sent with the message
   *
   * @todo Use the `this.user` object and not trust the UI
   */
  sendMessage(msg: Message, file?: File) {
    const curr = this.servers[this.currentServer].currentChannel;
    this.servers[this.currentServer].channels[curr].sendMessage(msg, file);
  }
}

/** The server object
 * @description
 * This class depends on the Channel class to function
 */

export class ServerObject {
  data: ServerData;
  members: {
    [key: string]: User;
  };
  channels: {
    [key: string]: ChannelObject;
  };
  isInitialized: boolean;
  currentChannel: string;
  isAttached: boolean;
  private ref: firebase.database.Reference;

  /**
   * Creates a new Server object
   * @param serverId A server ID
   */
  constructor(serverId: string) {
    this.data = {
      id: serverId,
      name: "",
      channels: [],
      owner: "",
    };
    this.members = {};
    this.channels = {};
    this.currentChannel = "";
    this.isInitialized = false;
    this.isAttached = false;
    this.ref = firebase.database().ref("servers/" + serverId + "");
    this.getDebug = this.getDebug.bind(this);
  }

  /**
   * Initializes the data and members listeners for this server
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   * @example
   * server.initialize((members) => this.setState({members}),
   *                   (data) => this.setState({data}))
   */
  initialize(
    updateMembers: (serverMembers: { [key: string]: User }) => void,
    updateData: (serverData: ServerData) => void
  ) {
    if (this.isInitialized) {
      this.ref.off();
    }
    this.isInitialized = true;
    this.isAttached = true;
    this.ref.child("data").on("value", (snap) => {
      this.data = { ...this.data, ...snap.val() };
      this.data.channels = Object.values(this.data.channels);
      console.log({ data: this.data });
      this.isAttached && updateData(this.data);
    });
    this.ref.child("members").on("value", (snap) => {
      this.members = snap.val();
      console.log({ members: this.members });
      this.isAttached && updateMembers(this.members);
    });
  }

  /**
   * Loads a certain channel in this server
   * @param channel The name of the channel
   * @param updateChannel A function pointing to a React setState
   *
   * @example
   * server.getChannel("general", (channel) => this.setState({channel}))
   */
  getChannel(channel: string, updateChannel: (channel: Channel) => void) {
    this.currentChannel.length && this.channels[this.currentChannel].detach();
    this.currentChannel = channel;
    if (Object.keys(this.channels).includes(channel)) {
      console.log("Attaching channel...", channel);
      this.channels[this.currentChannel].attach(updateChannel);
    } else {
      this.channels[this.currentChannel] = new ChannelObject(
        this.data.id,
        this.currentChannel
      );
      this.channels[this.currentChannel].initialize(updateChannel);
    }
  }

  /**
   * Adds an emote to this server
   * @param emoteName The name of the emote to be added
   * @param emote The image file
   */
  async addEmote(emoteName: string, emote: File) {
    const filename = emoteName + "." + emote.name.split(".").pop();
    const fileRef = await firebase
      .storage()
      .ref("servers/" + this.data.id + "/emotes/" + filename);
    await fileRef.put(emote).then(async (snap) => {
      const downloadUrl = await fileRef.getDownloadURL();
      this.ref.child("data/emotes/" + emoteName).set(downloadUrl);
    });
  }

  /**
   * Creates a new channel in this server
   * @param channel The name of the channel to be created
   * @param currentUser [*Optional*] Specifies who that created the channel
   */
  createChannel(channel: string, currentUser?: User) {
    //TODO: only owners should be able to create channels
    const id = Date.now() + String(Math.floor(Math.random() * 9));
    const newNode = this.ref.child("channels").child(channel).child(id);
    if (currentUser) {
      newNode.set({
        name: currentUser.name,
        userId: currentUser.userId,
        message: "[System]: " + currentUser.name + " created the channel.",
        timestamp: id,
      });
    } else {
      newNode.set({
        name: "unknown",
        userId: "0",
        message: "[System]: someone created the channel.",
        timestamp: id,
      });
    }

    const newNode2 = this.ref.child("data").child("channels").push();
    newNode2.set(channel);
  }

  /**
   * **[For debug only]** Prints all the relevant data contained in this server object
   */
  getDebug() {
    console.log({
      data: this.data,
      members: this.members,
      channels: this.channels,
    });
  }

  /**
   * Detaches the server's listeners from the React state
   */
  detach() {
    this.isAttached = false;
    this.currentChannel.length && this.channels[this.currentChannel].detach();
  }

  /**
   * Attaches the server's listeners to a React state
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   *
   * @example
   * server.detach()
   * //some code
   * server.attach((members) => this.setState({members}),
   *               (data) => this.setState({data}))
   */
  attach(
    updateMembers: (serverMembers: { [key: string]: User }) => void,
    updateData: (serverData: ServerData) => void
  ) {
    this.isAttached = true;
    updateMembers(this.members);
    updateData(this.data);
    //this.channels[this.currentChannel].attach(updateChannel);
  }

  /**
   * Destroys all the listeners in this server's object (incluiding the channels')
   */
  destroy() {
    for (let elem of Object.keys(this.channels)) {
      this.channels[elem].destroy();
    }
    this.ref.off();
    this.channels = {};
  }
}
/**
 * The channel class
 */
export class ChannelObject {
  serverId: string;
  name: string;
  cache: Channel;
  isInitialized: boolean;
  isAttached: boolean;
  private ref: firebase.database.Reference;

  /**
   * Creates the Channel object
   * @param serverId The ID of the server this channel is a part of
   * @param channelName The name of the channel
   */
  constructor(serverId: string, channelName: string) {
    this.serverId = serverId;
    this.name = channelName;
    this.cache = {};
    this.ref = firebase
      .database()
      .ref("servers/" + this.serverId + "/channels/" + this.name);
    this.isInitialized = false;
    this.isAttached = false;
    this.sendMessage = this.sendMessage.bind(this);
  }

  /**
   * Detaches the channel from the React state
   *
   * @example
   * channel.detach()
   * //some other code
   * channel.attach((channel) => this.setState({channel}))
   */
  detach() {
    this.isAttached = false;
  }

  /**
   * Attaches the listener to the React setState and inmediately updates the state.
   * @param updateState A function pointing to a React setState, if not specified the React state will not be updated until the channel is
   *
   * @example
   * channel.detach()
   * //some other code
   * channel.attach((channel) => this.setState({channel}))
   */
  attach(updateState?: (channel: Channel) => void) {
    updateState && updateState(this.cache);
    this.isAttached = true;
  }

  /**
   * Destroys the listener for this channel
   */
  destroy() {
    this.ref.off();
    this.cache = {};
  }

  /**
   * Starts listening for new messages on this channel
   * @param updateState A function pointing to a React setState
   *
   * @example
   * channel.initialize((channel: Channel) => this.setState({channel}));
   */
  initialize(updateState: (channel: Channel) => void) {
    if (this.isInitialized) {
      this.ref.off();
    }
    this.isAttached = true;
    this.ref
      .orderByKey()
      .limitToLast(15)
      .on("child_added", async (snap) => {
        if (snap.key) {
          const temp = snap.val();
          temp.timestamp = snap.key;
          this.cache[snap.key] = temp;
          if (temp.image) temp.image = await this.getImage(temp.image);
          this.isAttached && updateState(this.cache);
        }
      });
  }

  /**
   * Sends a message in the current channel
   *
   * @param msg An object with the correct Message format
   * @param [file] The image file to be sent with the message
   */
  sendMessage(msg: Message, file?: File) {
    const id = Date.now() + String(Math.floor(Math.random() * 9));
    console.log({ id, msg });

    const writer = this.ref.child(id);
    if (file) {
      console.log({ file });
      const filename = "servers/" + this.serverId + "/channels/" + this.name;
      const name = id + "." + file.name.split(".").pop();
      firebase
        .storage()
        .ref(filename)
        .child(name)
        .put(file)
        .then(() => writer.set({ ...msg, image: name }))
        .catch((error) => console.log(error));
    } else writer.set(msg);
  }

  /**
   * Retrieves the download URL for the specified image
   *
   * @param imageId The ID of the image to obtain
   *
   * @returns The download URL
   *
   */
  async getImage(imageId: string) {
    return await firebase
      .storage()
      .ref(
        "servers/" + this.serverId + "/channels/" + this.name + "/" + imageId
      )
      .getDownloadURL();
  }
}
