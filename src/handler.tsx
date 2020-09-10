import * as firebase from "firebase";
import * as r from "./reference"
import { firebaseConfig } from "./secretKey";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const reservedNames = [
  "_channelList", //stores the global channel names
  "_users", // stores the user data for all users
  "online", //online user list
];



window.firebase = firebase;

interface handler {
  _listRef: null | firebase.database.Reference,
  _chRef: null | firebase.database.Reference,
  _userRef: null | firebase.database.Reference,
  _onlineRef: null | firebase.database.Reference,
  _currentChannelCache: r.Channel,
  _writer: null | firebase.database.ThenableReference,
  currChannel: string,
  updateChannels: (callback: any) => void,
  updateMessages: (channel: string, callback: any) => void,
  initializeChannel: (channel: string, updateState: (channel: r.Channel) => void) => void,
  sendMessage: (msg: r.Message) => void,
  sendMessageWithImage: (msg: r.Message, file: File) => void,
  createChannel: (name: string, user: r.User) => void,
  signIn: (email: string, pass: string, callback: any) => void,
  signOut: () => void,
  getUserData: (callback: any) => void,
  getOnlineUsers: (callback: any) => void,
  createUser: (username: string, email: string, pass: string, callback: any) => void,
  uploadImage: (name: string, file: File, callback: any) => void,
  getImage: (id: string) => Promise<string>
}


const handler: handler = {
  _listRef: null,
  _chRef: null,
  _writer: null,
  _userRef: null,
  _onlineRef: null,
  _currentChannelCache: {},
  currChannel: "",
  updateChannels: function (callback): void {
    if (this._listRef) {
      this._listRef.off();
      this._listRef = null;
    }
    this._listRef = firebase.database().ref("_channelList");
    this._listRef.on("value", (snap) => callback(Object.values(snap.val())));
  },
  updateMessages: function (channel: string, callback): void {
    this.currChannel = channel;
    if (this._chRef) {
      this._chRef.off();
      this._chRef = null;
    }
    this._chRef = firebase.database().ref(channel);
    this._chRef.limitToLast(15).orderByChild("timestamp").on("child_added", (snap) => callback(snap.val(), snap.key));
  },
  initializeChannel: function (channel, updateState){
    this.currChannel = channel;
    if(this._chRef){
      this._currentChannelCache = {}
      this._chRef.off();
      this._chRef = null;
    }
    this._chRef = firebase.database().ref(channel);
    this._chRef.limitToLast(15).on("child_added", async (snap) => {
      const temp = snap.val()
      this._currentChannelCache[temp.timestamp] = temp
      if(temp.image){
        temp.image = await this.getImage(temp.image)
      }
      updateState(this._currentChannelCache)
    })
  },
  sendMessage: function (msg: r.Message): void {
    if(this._chRef){
      this._writer = this._chRef.push();
      this._writer.set({...msg, timestamp: Date.now()});
    }
  },
  sendMessageWithImage: function(msg: r.Message, file: File): void{ 
      //TODO add progress bar
      //add error handling
      //figure out where it can fail too 
    if(this._chRef){
      this._writer = this._chRef.push(); //create reference to new entry
      const name = this._writer.key + "." + file.name.split(".").pop()
      firebase
        .storage()
        .ref(this.currChannel+"/"+name)
        .put(file)
        .then(() => this._writer && this._writer.set({...msg, image: name, timestamp: Date.now()}))
        .catch((e) => console.log("An error ocurred while uploading a file", e));
    }
    
  },
  createChannel: function (name: string, user: r.User): void {
    if (!reservedNames.includes(name)) {
      try {
        let newNode = firebase.database().ref("_channelList").push();
        newNode.set(name);
        newNode = firebase.database().ref(name).push();
        newNode.set({
          name: user.name,
          message: "Created the channel",
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  signIn: function (email: string, pass: string, callback): void {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, pass)
      .then((user) => {
        user.user && callback(user.user.uid);
      })
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
  },
  signOut: function (): void {
    firebase.auth().signOut();
  },
  getUserData(callback): void{
    console.log("Getting user data...");
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        //is logged in
        console.log("User is logged in:", user.uid);
        this._userRef = firebase.database().ref("_users/" + user.uid);
        const onlineRef = firebase.database().ref("_online/"+user.uid)
        onlineRef.onDisconnect().remove()
        this._userRef.on("value", (snap) => {
            onlineRef.set(snap.val())
            callback(snap.val())
        });
      } else {
        //not
        console.log("Not logged in!");
        callback(false); //set user to false, show Login screen
      }
    });
  },
  getOnlineUsers(callback): void{
    this._onlineRef = firebase.database().ref("_online")
    this._onlineRef.on("value", (snap) => callback(snap.val()))
  },
  createUser(username: string, email: string, pass: string, callback): void {
    console.log("Creating new user:", { username, email });
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass)
      .then((user) => {
        console.log("Creating user", user.user && user.user.uid);
        user.user && firebase
          .database()
          .ref("_users/" + user.user.uid)
          .set({
            name: username,
            email,
            //todo create an addFeature method?
          });
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
  },
  uploadImage(name: string, file: File, callback): void {
    firebase
      .storage()
      .ref("test/" + name)
      .put(file)
      .then(callback)
      .catch((e) => console.log("An error ocurred while uploading a file", e));
  },
  getImage: async function(id: string): Promise<string> { //callback has to be a setState
    console.log("Obtaining "+id+" from "+this.currChannel+"...")
    return await firebase
      .storage()
      .ref(this.currChannel + "/" + id)
      .getDownloadURL()
      
  },
};

export { handler };
