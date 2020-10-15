import firebase from "firebase";
import { auth, firestore, storage } from "./handler3";

export async function uploadImage(
  file: File,
  isEmote: boolean = false,
  progressCallback?: (percentage: number) => void
) {
  const id = Date.now() + String(Math.floor(Math.random() * 9));
  const name = `${id}.${file.name.split(".").pop()}`;
  const ref = storage.ref(isEmote ? "emotes" : "images").child(name);
  await new Promise((resolve, reject) => {
    ref.put(file).on(
      "state_changed",
      progressCallback &&
        ((snap) => {
          progressCallback((snap.bytesTransferred / snap.totalBytes) * 100);
        }),
      (e) => {
        console.trace("An error ocurred while uploading this image", e);
        reject();
      },
      () => {
        resolve();
      }
    );
  });

  return await ref.getDownloadURL();
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
          friendReq: [], //TODO: move to a private sub soething idk
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

export async function getProfile(userId: string) {
  const snap = await firestore.collection("users").doc(userId).get();
  if (snap.exists) {
    const data = snap.data() as User;
    return data;
  } else {
    throw new Error(`The user (${userId}) does not exist`);
  }
}

export function ToDate(x: firebase.firestore.Timestamp) {
  return x.toDate();
}

export function ToTimestamp(x: Date) {
  return firebase.firestore.Timestamp.fromDate(x);
}

export function subscribeToProfile(
  userId: string,
  callback: (profile: User) => void
) {
  return firestore
    .collection("users")
    .doc(userId)
    .onSnapshot((snap) => {
      if (snap.exists) {
        callback(snap.data() as User);
      }
    });
}
