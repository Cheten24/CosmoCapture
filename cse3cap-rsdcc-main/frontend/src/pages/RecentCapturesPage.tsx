import { useEffect, useState } from "react"
import ScrollReveal from "../components/ScrollReveal"
import { apiService } from "../services/api"
import { Download, Calendar, MapPin } from "lucide-react"

interface Capture {
  id: string
  objectName?: string
  timestamp: string
  coordinates?: {
    ra?: number
    dec?: number
    alt?: number
    az?: number
  }
  file?: string
}

const RecentCapturesPage = () => {
  const [captures, setCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080"

  useEffect(() => {
    loadCaptures()
  }, [])

  const loadCaptures = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiService.listCaptures()
      setCaptures(res.items || [])
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Failed to load captures")
    } finally {
      setLoading(false)
    }
  }

  return (
    // FIX: Set background to transparent (bg-transparent) to let global particles show through.
    // ADD: relative z-10 and style={{ pointerEvents: 'all' }} to layer content above particles and keep it clickable.
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal direction="down" delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Recent Captures</h1>
            <p className="text-slate-400">Browse your recent telescope captures</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            {loading && (
              <div className="text-center text-slate-300 py-12">
                <p className="text-xl">Loading captures...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg mb-2">Error: {error}</p>
                <button
                  onClick={loadCaptures}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && captures.length === 0 && (
              <div className="text-center text-slate-300 py-12">
                <p className="text-xl">No captures yet</p>
                <p className="text-sm mt-2 text-slate-400">
                  Take a snapshot from the telescope feed page to see it here
                </p>
              </div>
            )}

            {!loading && !error && captures.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {captures.map((capture) => (
                  <div
                    key={capture.id}
                    className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {capture.objectName || "Unknown Object"}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(capture.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {capture.coordinates && (
                        <div className="mb-4 text-sm text-slate-300 space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">Coordinates:</span>
                          </div>
                          <div className="ml-5 grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>
                              RA: {capture.coordinates.ra?.toFixed(3) ?? "N/A"}
                            </div>
                            <div>
                              Dec: {capture.coordinates.dec?.toFixed(3) ?? "N/A"}
                            </div>
                            <div>
                              Alt: {capture.coordinates.alt?.toFixed(2) ?? "N/A"}°
                            </div>
                            <div>
                              Az: {capture.coordinates.az?.toFixed(2) ?? "N/A"}°
                            </div>
                          </div>
                        </div>
                      )}

                      <a
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                        href={`${base}/api/captures/${capture.id}/download`}
                        download
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}

export default RecentCapturesPage