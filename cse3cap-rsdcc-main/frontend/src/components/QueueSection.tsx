import { useState } from "react"

export default function QueueSection() {
  const [joined, setJoined] = useState(false)
  const [queueLength, setQueueLength] = useState(0)
  const [estimatedWait, setEstimatedWait] = useState(0)
  const [message, setMessage] = useState("")

  const handleJoinQueue = () => {
    if (joined) {
      setMessage("You have already joined the live viewing queue.")
      return
    }

    const newQueueLength = queueLength + 1
    const waitPerStudent = 15
    const newEstimatedWait = newQueueLength * waitPerStudent

    setQueueLength(newQueueLength)
    setEstimatedWait(newEstimatedWait)
    setJoined(true)
    setMessage("You have joined the live viewing queue.")
  }

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
              {queueLength} {queueLength === 1 ? "student" : "students"}
            </h3>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-5 shadow-md">
            <p className="text-slate-400 text-sm mb-2">Estimated Wait Time</p>
            <h3 className="text-3xl font-bold text-white">
              {estimatedWait} minutes
            </h3>
          </div>
        </div>

        <button
          onClick={handleJoinQueue}
          disabled={joined}
          className={`mt-8 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition duration-300 ${
            joined
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-105"
          }`}
        >
          {joined ? "Queue Joined" : "Join Queue"}
        </button>

        {message && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 font-medium ${
              joined
                ? "bg-green-500/10 border-green-400 text-green-300"
                : "bg-red-500/10 border-red-400 text-red-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </section>
  )
}