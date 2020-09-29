import * as firebase from "firebase";
import { useEffect, useState } from "react";
import { firebaseConfig } from "../secretKey";
import * as r from "../reference";
import { Message } from "../components/Message";

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const db = firebase.database();
export const storage = firebase.storage();
export const auth = firebase.auth();

//TODO: create a proxy object between the firebase SDK and the hook for caching

export class Handler3 {}
