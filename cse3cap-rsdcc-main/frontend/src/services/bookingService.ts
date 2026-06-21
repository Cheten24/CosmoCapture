import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"

import { auth, db } from "../firebase"

export async function createBooking(
  targetObject: string,
  startTime: string,
  endTime: string
) {
  const user = auth.currentUser

  if (!user) {
    throw new Error("User not logged in")
  }

  return addDoc(collection(db, "bookings"), {
    userId: user.uid,
    userEmail: user.email,
    targetObject,
    startTime,
    endTime,
    status: "queued",
    createdAt: serverTimestamp(),
  })
}

export async function getBookings() {
  const q = query(
    collection(db, "bookings"),
    orderBy("startTime", "asc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}