import firebase from "firebase";
import { firestore } from "./handler3";
import { uploadImage } from "./miscFunctions";

export function createEmoteFunctions(serverId: string) {
  const serverRef = firestore.collection("servers").doc(serverId);
  return {
    add: async (emoteName: string, emote: File) => {
      return await serverRef.update({
        [`emotes.${emoteName}`]: await uploadImage(emote, true),
      });
    },
    addUrl: async (emoteName: string, emoteUrl: string) => {
      return await serverRef.update({
        [`emotes.${emoteName}`]: emoteUrl,
      });
    },
    delete: async (emoteName: string) => {
      return await serverRef.update({
        [`emotes.${emoteName}`]: firebase.firestore.FieldValue.delete(),
      });
    },
  };
}

export function createMessageFunctions(serverId: string, channelName: string) {
  const channelRef = firestore
    .collection("servers")
    .doc(serverId)
    .collection("channels")
    .doc(channelName);
  return {
    send: async (msg: Omit<Message, "id">, file?: File) => {
      const ts = new Date();
      const msgObj: Message = {
        ...msg,
        id: ts.valueOf(),
      };
      if (file) {
        msgObj.image = await uploadImage(file);
        console.log({ msgObj });
      }
      return channelRef.update({
        [`messages.${msgObj.id}`]: msgObj,
      });
    },
    delete: async (msgId: number) => {
      return await channelRef.update({
        [`messages.${msgId}`]: firebase.firestore.FieldValue.delete(),
      });
    },
  };
}

export function createChannelFunctions(serverId: string) {
  const serverRef = firestore.collection("servers").doc(serverId);
  return {
    create: async (channelName: string) => {
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
    },
    remove: async (channelName: string) => {
      const channelRef = serverRef.collection("channels").doc(channelName);
      await serverRef.update({
        channels: firebase.firestore.FieldValue.arrayRemove(channelName),
      });
      await channelRef.delete();
    },
  };
}
