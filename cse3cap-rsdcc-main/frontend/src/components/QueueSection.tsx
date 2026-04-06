import { useState } from "react"

export default function QueueSection() {
  const [joined, setJoined] = useState(false)

  const queueLength = 0
  const estimatedWait = "0 minutes"

  return (
    <section className="mb-14">
      <div className="mb-5">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Join the Live Queue
        </h2>
        <p className="text-slate-300 text-lg max-w-3xl">
          Students can join the queue to access the live telescope feed when a
          viewing session becomes available.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-800/45 backdrop-blur-sm p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5">
            <p className="text-slate-400 text-sm mb-2">Current Queue</p>
            <h3 className="text-3xl font-bold text-white">{queueLength} students</h3>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5">
            <p className="text-slate-400 text-sm mb-2">Estimated Wait Time</p>
            <h3 className="text-3xl font-bold text-white">{estimatedWait}</h3>
          </div>
        </div>

        <button
          onClick={() => setJoined(true)}
          className="mt-8 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-105 transition duration-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          Join Queue
        </button>

        {joined && (
          <p className="mt-5 text-green-300 font-medium">
            You have joined the live viewing queue.
          </p>
        )}
      </div>
    </section>
  )
}