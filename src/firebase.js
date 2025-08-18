import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRHpP2MMZ6sr4JwlzlThN0sn7SMQCny14",
  authDomain: "rush-forum.firebaseapp.com",
  projectId: "rush-forum",
  storageBucket: "rush-forum.firebasestorage.app",
  messagingSenderId: "249624287649",
  appId: "1:249624287649:web:ff2f571559b8efe72cd3e0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();