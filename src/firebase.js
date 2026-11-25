import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Remplace les valeurs ci-dessous par celles de ton projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzrozNog57LAm2JOAbEg-4nG6BIIJewGc",
  authDomain: "vote-direct-d4f73.firebaseapp.com",
  databaseURL: "https://vote-direct-d4f73-default-rtdb.firebaseio.com",
  projectId: "vote-direct-d4f73",
  storageBucket: "vote-direct-d4f73.firebasestorage.app",
  messagingSenderId: "459262113370",
  appId: "1:459262113370:web:e3002090d6fd3b0b204a63",
  measurementId: "G-L74BZF3QW4"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);