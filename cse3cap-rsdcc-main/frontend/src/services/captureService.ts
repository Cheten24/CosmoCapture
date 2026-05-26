import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore"

import { auth, db } from "../firebase"

export async function saveCapture(
  imageData: string,
  targetObject = "Telescope View"
) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not logged in")
  }

  return addDoc(collection(db, "captures"), {
    userId: user.uid,
    userEmail: user.email,
    imageData,
    targetObject,
    capturedAt: serverTimestamp(),
  })
}

export async function getMyCaptures() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not logged in")
  }

  const q = query(
    collection(db, "captures"),
    where("userId", "==", user.uid),
    orderBy("capturedAt", "desc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}