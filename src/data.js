import * as firebase from "firebase";
import { firebaseConfig } from "./secretKey";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const reservedNames = [
  "_channelList", //stores the global channel names
  "_users", // stores the user data for all users
];

window.firebase = firebase;

const handler = {
  _listRef: null,
  _chRef: null,
  _writer: null,
  _userRef: null,
  currChannel: "",
  updateChannels: function (callback) {
    if (this._listRef) {
      this._listRef.off();
      this._listRef = null;
    }
    this._listRef = firebase.database().ref("_channelList");
    this._listRef.on("value", callback);
  },
  updateMessages: function (channel, callback) {
    this.currChannel = channel;
    if (this._chRef) {
      this._chRef.off();
      this._chRef = null;
    }
    this._chRef = firebase.database().ref(channel);
    this._chRef.orderByChild("timestamp").on("child_added", callback);
  },
  sendMessage: function (msg) {
    this._writer = this._chRef.push();
    this._writer.set({...msg, timestamp: Date.now()});
  },
  sendMessageWithImage: function(msg, file){ 
      //TODO add progress bar
      //add error handling
      //figure out where it can fail too 
    this._writer = this._chRef.push(); //create reference to new entry
    const name = this._writer.path.pieces_.slice(-1)[0] + "." + file.name.split(".").pop()
    firebase
      .storage()
      .ref(this.currChannel+"/"+name)
      .put(file)
      .then(() => this._writer.set({...msg, image: name, timestamp: Date.now()}))
      .catch((e) => console.log("An error ocurred while uploading a file", e));
  },
  createChannel: function (name, user) {
    if (!reservedNames.includes(name)) {
      try {
        let newNode = firebase.database().ref("_channelList").push();
        newNode.set(name);
        newNode = firebase.database().ref(name).push();
        newNode.set({
          name: user,
          message: "Created the channel",
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  signIn: function (email, pass, callback) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, pass)
      .then((user) => {
        callback(user.user.uid);
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
  signOut: function (callback) {
    firebase.auth.signOut().then(callback);
  },
  getUserData(callback) {
    console.log("Getting user data...");
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        //is logged in
        console.log("User is logged in:", user.uid);
        this._userRef = firebase.database().ref("_users/" + user.uid);
        this._userRef.on("value", (snap) => callback(snap.val()));
      } else {
        //not
        console.log("Not logged in!");
        callback(false); //set user to false, show Login screen
      }
    });
  },
  createUser(username, email, pass, callback) {
    console.log("Creating new user:", { username, email });
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, pass)
      .then((user) => {
        console.log("Creating user", user.user.uid);
        firebase
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
  uploadImage(name, file, callback) {
    firebase
      .storage()
      .ref("test/" + name)
      .put(file)
      .then(callback)
      .catch((e) => console.log("An error ocurred while uploading a file", e));
  },
  getImage(id, callback) { //callback has to be a setState
    console.log("Obtaining "+id+" from "+this.currChannel+"...")
    firebase
      .storage()
      .ref(this.currChannel + "/" + id)
      .getDownloadURL()
      .then(callback);
  },
};

export { handler };
