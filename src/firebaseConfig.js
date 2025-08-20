// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  authDomain: "telecom-map-993c0.firebaseapp.com",
  projectId: "telecom-map-993c0",
  storageBucket: "telecom-map-993c0.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

