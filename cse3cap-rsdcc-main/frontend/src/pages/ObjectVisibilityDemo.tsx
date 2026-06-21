import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Eye, MapPin, Clock, RefreshCw, Telescope } from "lucide-react"

type VisibleObject = {
  id: number
  name: string
  type: string
  visibility: string
  direction: string
  bestTime: string
  description: string
}

export default function ObjectVisibilityDemo() {
  const [objects, setObjects] = useState<VisibleObject[]>([])
  const [currentTime, setCurrentTime] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchVisibleObjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("http://127.0.0.1:5000/api/object-visibility")
      const data = await response.json()

      if (data.success) {
        setObjects(data.objects || [])
        setCurrentTime(data.currentTime || "")
        setLocation(data.location || "Melbourne Observatory")
      } else {
        setError("Failed to get visible objects")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to get visible objects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisibleObjects()
  }, [])

  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition">
              <ArrowLeft className="h-6 w-6 text-slate-400" />
            </Link>

            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Object Visibility
              </h1>
              <p className="text-slate-400">
                Visible objects are shown using current time and viewing conditions.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Telescope className="h-6 w-6" />
            <span className="text-sm">Melbourne Observatory</span>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur-md p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <Eye className="h-8 w-8 text-blue-300" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Currently Visible Right Now
                </h2>
                <p className="text-slate-400">
                  Filtered according to current time and visibility conditions.
                </p>
              </div>
            </div>

            <button
              onClick={fetchVisibleObjects}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white hover:bg-slate-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-white font-semibold">{location}</p>
              <p className="text-slate-500 text-sm">Melbourne, Australia</p>
            </div>

            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <Clock className="h-4 w-4" />
                Current Time
              </div>
              <p className="text-white font-semibold">{currentTime}</p>
              <p className="text-slate-500 text-sm">Live backend time</p>
            </div>

            <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/60 p-4">
              <p className="text-emerald-300 text-sm mb-2">Visibility Filter</p>
              <p className="text-white font-semibold">Weather + Time Based</p>
              <p className="text-slate-400 text-sm">
                Only currently visible objects are shown.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur-md p-6 shadow-2xl">
          {loading && (
            <p className="text-slate-400 text-center py-16">
              Loading visible objects...
            </p>
          )}

          {error && (
            <p className="text-red-400 text-center py-16">
              Error: {error}
            </p>
          )}

          {!loading && !error && objects.length === 0 && (
            <p className="text-slate-400 text-center py-16">
              No objects are currently visible.
            </p>
          )}

          {!loading && !error && objects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {objects.map((object) => (
                <div
                  key={object.id}
                  className="rounded-2xl bg-slate-800/80 border border-slate-700 p-6 hover:border-blue-500/60 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-white">
                      {object.name}
                    </h3>

                    <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-sm">
                      {object.type}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-4">
                    {object.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-500">Visibility</p>
                      <p className="text-green-400 font-semibold">
                        {object.visibility}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-500">Direction</p>
                      <p className="text-white font-semibold">
                        {object.direction}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-500">Best Time</p>
                      <p className="text-white font-semibold">
                        {object.bestTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}