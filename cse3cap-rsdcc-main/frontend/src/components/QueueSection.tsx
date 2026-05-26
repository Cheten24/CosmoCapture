import { useState, useEffect } from "react"

import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"

import { db } from "../firebase"

export default function QueueSection() {
  const [queueBookings, setQueueBookings] = useState<any[]>([])

useEffect(() => {

  const q = query(
    collection(db, "bookings"),
    orderBy("createdAt", "asc")
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {

    const bookings = snapshot.docs.map((doc, index) => ({
      id: doc.id,
      queuePosition: index + 1,
      ...doc.data(),
    }))

    setQueueBookings(bookings)
  })

  return () => unsubscribe()

}, [])

  return (
    <section className="mb-14">
      <div className="mb-5">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Join the Live Queue
        </h2>
        <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
          Students can join the queue to access the live telescope feed when a
          viewing session becomes available.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-800/45 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5 shadow-md">
            <p className="text-slate-400 text-sm mb-2">Current Queue</p>
            <h3 className="text-3xl font-bold text-white">
              {queueBookings.length} {queueBookings.length === 1 ? "student" : "students"}
            </h3>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5 shadow-md">
            <p className="text-slate-400 text-sm mb-2">Estimated Wait Time</p>
            <h3 className="text-3xl font-bold text-white">
              {queueBookings.length * 15} minutes
            </h3>
          </div>
                </div>
      </div>
    </section>
  )
}