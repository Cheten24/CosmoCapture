import { useEffect, useState, useImperativeHandle, forwardRef } from "react"
import { apiService } from "../services/api"

export interface RecentCapturesRef {
  refresh: () => Promise<void>
}

const RecentCaptures = forwardRef<RecentCapturesRef>((_, ref) => {
  const [items, setItems] = useState<Array<{
    id: string
    objectName?: string
    timestamp: string
    coordinates?: {
      ra?: number
      dec?: number
      alt?: number
      az?: number
    }
  }>>([])
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080"

  const loadCaptures = async () => {
    try {
      const res = await apiService.listCaptures()
      setItems(res.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  useImperativeHandle(ref, () => ({
    refresh: loadCaptures,
  }))

  useEffect(() => {
    loadCaptures()
  }, [])

  return (
    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <h3 className="text-slate-200 font-semibold mb-3">Recent Captures</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-slate-100">{it.objectName || "Unknown"}</div>
              <div className="text-slate-400">{new Date(it.timestamp).toLocaleString()}</div>
              {it.coordinates && (
                <div className="text-slate-400">
                  RA {it.coordinates.ra?.toFixed?.(3)}, Dec {it.coordinates.dec?.toFixed?.(3)} | Alt {it.coordinates.alt?.toFixed?.(2)}°, Az {it.coordinates.az?.toFixed?.(2)}°
                </div>
              )}
            </div>
            <a
              className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm"
              href={`${base}/api/captures/${it.id}/download`}
              download
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
})

RecentCaptures.displayName = "RecentCaptures"

export default RecentCaptures
