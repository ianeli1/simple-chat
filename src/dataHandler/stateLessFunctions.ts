import firebase from "firebase";
import { auth, firestore, storage } from "./handler3";

export async function uploadImage(file: File, isEmote: boolean = false) {
  const id = Date.now() + String(Math.floor(Math.random() * 9));
  const name = `${id}.${file.name.split(".").pop()}`;
  const uploadTask = await storage
    .ref(isEmote ? "emotes" : "images")
    .child(name)
    .put(file);
  return await uploadTask.ref.getDownloadURL();
}

export function createSendMessage(serverId: string, channelName: string) {
  return async (msg: Message, file?: File) => {
    const msgObj = { ...msg };
    const channelRef = firestore
      .collection("servers")
      .doc(serverId)
      .collection("channels")
      .doc(channelName);
    if (file) {
      msgObj.image = await uploadImage(file);
      console.log({ msgObj });
    }
    return channelRef.update({
      [`messages.${Date.now()}`]: msgObj,
    });
  };
}

export function createAddEmote(serverId: string) {
  return async (emoteName: string, emote: File) => {
    const serverRef = firestore.collection("servers").doc(serverId);
    return serverRef.update({
      [`emotes.${emoteName}`]: await uploadImage(emote, true),
    });
  };
}

export function createCreateServer(ownerId: string) {
  return async (serverName: string) => {
    if (serverName) {
      const id = `${serverName.slice(0, 10)}-${Date.now()
        .toString()
        .slice(-4)}`;
      const serverObj: ServerData = {
        id,
        name: serverName,
        ownerId,
        channels: ["general"],
        emotes: {},
      };
      await firestore.collection("servers").doc(id).set(serverObj);
      await createCreateChannel(id)("general");
      return await createJoinServer(ownerId)(id);
    }
  };
}

export function signIn(
  email: string,
  pass: string,
  callback: (x: string) => void
) {
  auth.signInWithEmailAndPassword(email, pass).catch((e) => {
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

export function createUser(
  name: string,
  email: string,
  pass: string,
  callback: (x: string) => void
) {
  auth
    .createUserWithEmailAndPassword(email, pass)
    .then(async (user) => {
      if (user.user) {
        const userObj: User = {
          name,
          userId: user.user.uid,
          icon: null, //TODO: add an option to set an icon during registration
          servers: [],
          friends: [],
          friendReq: {}, //TODO: move to a private sub soething idk
        };
        await firestore.collection("users").doc(user.user.uid).set(userObj);
      } else {
        throw new Error("An unhandled ocurred while creating this account");
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

export function signOut() {
  auth.signOut();
}

export function createJoinServer(userId: string) {
  //TODO: turn this into a cloud function
  return async (serverId: string) => {
    if (serverId) {
      const userNode = firestore.collection("users").doc(userId);
      return userNode.update({
        servers: firebase.firestore.FieldValue.arrayUnion(serverId),
      });
    }
  };
}

export function ToDate(x: firebase.firestore.Timestamp) {
  return x.toDate();
}

export function ToTimestamp(x: Date) {
  return firebase.firestore.Timestamp.fromDate(x);
}

export function createCreateChannel(serverId: string) {
  //TODO: this should be a cloud function
  return async (channelName: string) => {
    const serverRef = firestore.collection("servers").doc(serverId);
    const channelRef = serverRef.collection("channels").doc(channelName);
    await serverRef.update({
      channels: firebase.firestore.FieldValue.arrayUnion(channelName),
    });
    return await channelRef.set({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      messages: {
        0: {
          message: "This channel was created",
          name: "<Owner name goes here oops>", //TODO: figure this out
          timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
          userId: "<owner id goes here>",
        } as Message,
      },
    });
  };
}

export async function getProfile(userId: string) {
  const snap = await firestore.collection("users").doc(userId).get();
  if (snap.exists) {
    const data = snap.data() as User;
    return data;
  } else {
    throw new Error(`The user (${userId}) does not exist`);
  }
}

export function createFriendRequestFuncs(currentUserId: string) {
  return {
    sendFriendRequest: async (userId: string) => {
      return await firestore
        .collection("users")
        .doc(userId)
        .update({
          friendReq: firebase.firestore.FieldValue.arrayUnion(currentUserId),
        });
    },
    acceptFriendRequest: async (userId: string) => {
      await firestore
        .collection("users")
        .doc(userId)
        .update({
          friends: firebase.firestore.FieldValue.arrayUnion(currentUserId),
        });
      return await firestore
        .collection("users")
        .doc(currentUserId)
        .update({
          friends: firebase.firestore.FieldValue.arrayUnion(userId),
          friendReq: firebase.firestore.FieldValue.arrayRemove(userId),
        });
    },
    removeFriend: async (userId: string) => {
      await firestore
        .collection("users")
        .doc(userId)
        .update({
          friends: firebase.firestore.FieldValue.arrayRemove(currentUserId),
        });
      return await firestore
        .collection("users")
        .doc(currentUserId)
        .update({
          friends: firebase.firestore.FieldValue.arrayRemove(userId),
        });
    },
  };
}
