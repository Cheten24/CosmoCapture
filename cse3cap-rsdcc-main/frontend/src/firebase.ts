<<<<<<< HEAD
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "TEMP",
  authDomain: "TEMP",
  projectId: "TEMP",
  storageBucket: "TEMP",
  messagingSenderId: "TEMP",
  appId: "TEMP",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
=======
import { initializeApp } from "firebase/app";

import {
  getFirestore
} from "firebase/firestore";

import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbW_Tskw0rdv0EWKW2KyNi6tnAhgY7Z9o",
  authDomain: "cosmocapture-2d88e.firebaseapp.com",
  projectId: "cosmocapture-2d88e",
  storageBucket: "cosmocapture-2d88e.firebasestorage.app",
  messagingSenderId: "15600910280",
  appId: "1:15600910280:web:dfbf4638218eed8cfcafd",
  measurementId: "G-JV01G53CZ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
>>>>>>> 4f2fba1230ab6e6c1402773a2a599ce7ad579245
