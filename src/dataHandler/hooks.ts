import firebase from "firebase";
import { useState, useEffect } from "react";
import {
  createAddEmote,
  createCreateServer,
  createFriendRequestFuncs,
  createJoinServer,
  createSendMessage,
  createCreateChannel,
} from "./stateLessFunctions";

export function useServer(serverId?: string) {
  //TODO: members HAVE to be managed via Realtime database
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [addEmote, setAddEmote] = useState<
    null | ((emoteName: string, emote: File) => Promise<void>)
  >(null);
  const [createChannel, setCreateChannel] = useState<
    null | ((channelName: string) => Promise<void>)
  >(null);
  let unsub: () => void;
  useEffect(() => {
    if (serverId) {
      unsub = firebase
        .firestore()
        .collection("servers")
        .doc(serverId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data() as ServerData;
            setServerData(data);
            setAddEmote(() => createAddEmote(data.id));
            setCreateChannel(() => createCreateChannel(data.id));
          } else {
            setServerData(null);
            setAddEmote(null);
            setCreateChannel(null);
            throw new Error("This server does not have any metadata");
          }
        });
    }
  }, [serverId]);

  return { serverData, addEmote, createChannel };
}

export function useChannel(serverId: string, channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sendMessage, setSendMessage] = useState<
    null | ((msg: Message, file?: File) => void)
  >(null);
  //const [channelData, setChannel] = useState< TODO: implement
  let unsub: () => void;
  useEffect(() => {
    console.log("loading channel", { serverId, channelName });
    unsub = firebase
      .firestore()
      .collection("servers")
      .doc(serverId)
      .collection("channels")
      .doc(channelName)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data() as { messages: Channel };
          setChannel(data.messages);
          setSendMessage(() => createSendMessage(serverId, channelName));
        } else {
          setChannel(null);
          setSendMessage(null);
          throw new Error("This channel does not exist");
        }
      });

    return () => {
      unsub && unsub();
    };
  }, [serverId, channelName]);

  return { channel, sendMessage };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [joinServer, setJoinServer] = useState<
    ((serverId: string) => Promise<void>) | null
  >(null);
  const [createServer, setCreateServer] = useState<
    null | ((serverName: string) => Promise<void>)
  >(null);

  const [friendFunctions, setFriendFunctions] = useState<{
    sendFriendRequest: (userId: string) => Promise<void>;
    acceptFriendRequest: (userId: string) => Promise<void>;
    removeFriend: (userId: string) => Promise<void>;
  } | null>(null);
  let unsub: () => void;
  let unsubAuth: firebase.Unsubscribe;
  useEffect(() => {
    unsubAuth = firebase.auth().onAuthStateChanged(async (user) => {
      if (user?.uid) {
        unsub = firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .onSnapshot((doc) => {
            if (doc.exists) {
              const data = doc.data() as User;
              setUser(data);
              setJoinServer(() => createJoinServer(data.userId));
              setCreateServer(() => createCreateServer(data.userId));
              setFriendFunctions(() => createFriendRequestFuncs(data.userId));
            } else {
              setUser(null);
              setJoinServer(null);
              setCreateServer(null);
              setFriendFunctions(null);
              throw new Error("Logged in user does not exist in database");
            }
          });
      }
    });
    return () => {
      unsub && unsub();
      unsubAuth && unsubAuth();
    };
  }, []);
  return { user, joinServer, createServer, friendFunctions };
}
