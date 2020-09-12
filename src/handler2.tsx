import * as r from "./reference";
import * as firebase from "firebase";
import { firebaseConfig } from "./secretKey";

firebase.initializeApp(firebaseConfig);

export class Handler {
  user: r.User | null;
  servers: {
    [key: string]: Server;
  };
  currentServer: string;
  private userRef: firebase.database.Reference;
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
  }

  joinServer(serverId: string) {
    if (this.user) {
      const userNode = firebase
        .database()
        .ref("users/" + this.user.userId + "/servers")
        .push();
      userNode.set(serverId);
    }
  }

  createChannel(channelName: string) {
    this.user &&
      this.servers[this.currentServer].createChannel(channelName, this.user);
  }

  createServer(serverName: string) {
    //use createChannel & joinServer
    const serverNode = firebase.database().ref("servers").push();
    const key = Date.now() + String(Math.floor(Math.random() * 9));
    if (this.user && serverNode.key) {
      let server: {
        data: r.Server;
        members: { [key: string]: r.User };
        channels: { [x: string]: r.Channel };
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
              timestamp: Number(key),
            },
          },
        },
      };
      serverNode.set(server);
      this.joinServer(serverNode.key);
    }
  }

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

  createUser(username: string, email: string, pass: string, callback: (x: string) => void) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass)
      .then((user) => {
          if(user.user){
            firebase
            .database()
            .ref("users/" + user.user.uid)
            .set({
                name: username,
                servers: ["123"]
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

  signOut() {
    firebase.auth().signOut();
  }

  getUser(updateUser: (user: r.User | null) => void) {
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

  initialize(updateUser: (user: r.User) => void) {
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
      
      if(this.user.servers){
        for (let elem of this.user.servers) {
            const tempRef = firebase.database().ref("servers/"+elem+"/members/"+this.user.userId+"/status")
            tempRef.onDisconnect().set("offline")
            tempRef.set("online")
        }
      }
    }
  }

  loadServer(
    serverId: string,
    updateMembers: (serverMembers: { [key: string]: r.User }) => void,
    updateData: (serverData: r.Server) => void
  ) {
    this.currentServer.length && this.servers[this.currentServer].detach();
    this.currentServer = serverId;
    if (Object.keys(this.servers).includes(serverId)) {
      this.servers[this.currentServer].attach(updateMembers, updateData);
    } else {
      this.servers[this.currentServer] = new Server(serverId);
      this.servers[this.currentServer].initialize(updateMembers, updateData);
    }
  }

  getChannel(channel: string, updateChannel: (channel: r.Channel) => void) {
    this.servers[this.currentServer].getChannel(channel, updateChannel);
  }

  sendMessage(msg: r.Message, file?: File) {
    const curr = this.servers[this.currentServer].currentChannel;
    this.servers[this.currentServer].channels[curr].sendMessage(msg, file);
  }
}

class Server {
  data: r.Server;
  members: {
    [key: string]: r.User;
  };
  channels: {
    [key: string]: Channel;
  };
  isInitialized: boolean;
  currentChannel: string;
  isAttached: boolean;
  private ref: firebase.database.Reference;
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
  }

  initialize(
    updateMembers: (serverMembers: { [key: string]: r.User }) => void,
    updateData: (serverData: r.Server) => void
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

  getChannel(channel: string, updateChannel: (channel: r.Channel) => void) {
    this.currentChannel.length && this.channels[this.currentChannel].detach();
    this.currentChannel = channel;
    if (Object.keys(this.channels).includes(channel)) {
      console.log("Attaching channel...", channel);
      this.channels[this.currentChannel].attach(updateChannel);
    } else {
      this.channels[this.currentChannel] = new Channel(
        this.data.id,
        this.currentChannel
      );
      this.channels[this.currentChannel].initialize(updateChannel);
    }
  }

  createChannel(channel: string, currentUser: r.User) {
    //TODO: only owners should be able to create channels
    const id = Date.now() + String(Math.floor(Math.random() * 9));
    const newNode = this.ref.child("channels").child(channel).child(id);
    newNode.set({
      name: currentUser.name,
      userId: currentUser.userId,
      message: "[System]: " + currentUser.name + " created the channel.",
      timestamp: id,
    });
    const newNode2 = this.ref.child("data").child("channels").push();
    newNode2.set(channel);
  }

  detach() {
    this.isAttached = false;
    this.currentChannel.length && this.channels[this.currentChannel].detach();
  }

  attach(
    updateMembers: (serverMembers: { [key: string]: r.User }) => void,
    updateData: (serverData: r.Server) => void
  ) {
    this.isAttached = true;
    updateMembers(this.members);
    updateData(this.data);
    //this.channels[this.currentChannel].attach(updateChannel);
  }

  destroy() {
    for (let elem of Object.keys(this.channels)) {
      this.channels[elem].destroy();
    }
    this.ref.off();
    this.channels = {};
  }
}

class Channel {
  serverId: string;
  name: string;
  cache: r.Channel;
  isInitialized: boolean;
  isAttached: boolean;
  private ref: firebase.database.Reference;
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

  detach() {
    this.isAttached = false;
  }

  attach(updateState: (channel: r.Channel) => void) {
    updateState(this.cache);
    this.isAttached = true;
  }

  destroy() {
    this.ref.off();
    this.cache = {};
  }

  initialize(updateState: (channel: r.Channel) => void) {
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

  sendMessage(msg: r.Message, file?: File) {
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

  async getImage(imageId: string) {
    return await firebase
      .storage()
      .ref(
        "servers/" + this.serverId + "/channels/" + this.name + "/" + imageId
      )
      .getDownloadURL();
  }
}
