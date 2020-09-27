import * as firebase from "firebase";
import { firebaseConfig } from "./secretKey";
import * as r from "./reference";
import { ServerObject } from "./dataHandler/serverObject";
import { MiscACT } from "./components/Intermediary";
import { serverACT } from "./dataHandler/reducer";

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
  private dispatch: React.Dispatch<Action>;
  /**Creates a new ***The*** Handler object */
  constructor() {
    this.user = null;
    this.dispatch = () => void null;
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

  connect(dispatch: React.Dispatch<Action>) {
    this.dispatch = dispatch;
  }

  createRef(serverId: string) {
    return {
      db: firebase.database().ref(`servers/${serverId}`),
      storage: firebase.storage().ref(`servers/${serverId}`),
    };
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
          channels: ["general"],
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
  getUser() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user?.uid) {
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
        this.initialize();
      } else {
        this.userRef.off();
        this.user = null;
      }
      this.user && this.dispatch({ type: MiscACT.SET_USER, user: this.user });
    });
  }

  /**
   * Initializes the listener for the current user's data.
   * `handler.getUser()` calls this method after a succesful login
   * @param updateUser A function pointing to a React setState
   * @example
   * handler.initialize((user) => this.setState({user}))
   */
  initialize() {
    if (this.user) {
      this.userRef
        .child(this.user.userId)
        .on("value", (snap: firebase.database.DataSnapshot) => {
          const temp = snap.val();
          this.dispatch({
            type: MiscACT.SET_USER,
            user: {
              ...this.user,
              ...temp,
              servers: Object.values(temp.servers),
            },
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
  async loadServer(serverId: string) {
    this.currentServer.length && this.servers[this.currentServer].detach();
    this.currentServer = serverId;
    if (Object.keys(this.servers).includes(serverId)) {
      this.servers[this.currentServer].attach(
        (members) =>
          void this.dispatch({
            type: serverACT.SET_MEMBERS,
            serverId,
            members,
          }),
        (data) =>
          void this.dispatch({ type: serverACT.SET_DATA, serverId, data })
      );
    } else {
      this.servers[this.currentServer] = new ServerObject(
        this.createRef(serverId)
      );
      await this.servers[this.currentServer].initialize(
        (members) =>
          void this.dispatch({
            type: serverACT.SET_MEMBERS,
            serverId,
            members,
          }),
        (data) =>
          void this.dispatch({ type: serverACT.SET_DATA, serverId, data })
      );
      this.dispatch({ type: MiscACT.SET_CURRENT_SERVER, current: serverId });
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
  getChannel(channel: string) {
    this.servers[this.currentServer].getChannel(channel, (channelObj) =>
      this.dispatch({
        type: serverACT.SET_CHANNEL,
        serverId: this.currentServer,
        channelName: channel,
        channel: channelObj,
      })
    );
    this.dispatch({
      type: MiscACT.SET_CURRENT_CHANNEL,
      current: channel,
    });
  }

  /**
   * Sends a new message to the specified channel
   * @param msg The message object to be sent, must be in the Message format
   * @param file [*Optional*] An image file to be sent with the message
   *
   * @todo Use the `this.user` object and not trust the UI
   */
  sendMessage(msg: Message, file?: File) {
    if (this.user) {
      const curr = this.servers[this.currentServer].currentChannel;
      this.servers[this.currentServer].channels[curr].sendMessage(msg, file);
    }
  }
}
