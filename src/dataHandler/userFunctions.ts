import firebase from "firebase";
import { auth, firestore, storage } from "./handler3";
import { createChannelFunctions } from "./serverFunctions";

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
      await createChannelFunctions(id).create("general");
      return await createJoinServer(ownerId)(id);
    }
  };
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

export function createLeaveServer(userId: string) {
  return async (serverId: string) => {
    const userNode = firestore.collection("users").doc(userId);
    return userNode.update({
      servers: firebase.firestore.FieldValue.arrayRemove(serverId),
    });
  };
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
    declineFriendRequest: async (userId: string) => {
      return await firestore
        .collection("users")
        .doc(currentUserId)
        .update({
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
