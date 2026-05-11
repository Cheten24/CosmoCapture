import React, { useRef, useState } from "react"
import { apiService } from "../services/api"
import { Check, AlertCircle, Loader2 } from "lucide-react"

type Props = {
  /** Pass a ref to the <video> used by WebRTCStreamPlayer */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** The currently selected object name (from TelescopeControlPanel) */
  selectedObjectName: string
  /** Optional callback when capture succeeds */
  onCaptureSuccess?: () => void
}

const SnapshotCapture: React.FC<Props> = ({ videoRef, selectedObjectName, onCaptureSuccess }) => {
  const [busy, setBusy] = useState(false)
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const capture = async () => {
    const v = videoRef.current
    if (!v) {
      setMessage({ type: "error", text: "Video stream not ready. Please wait for the stream to load." })
      return
    }
    if (!v.videoWidth || !v.videoHeight) {
      setMessage({ type: "error", text: "Video dimensions not available. Please ensure stream is playing." })
      return
    }
    
    setBusy(true)
    setMessage(null)
    
    try {
      // 1) read a frame into canvas
      const w = v.videoWidth
      const h = v.videoHeight
      let canvas = canvasRef.current
      if (!canvas) {
        canvas = document.createElement("canvas")
        canvasRef.current = canvas
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get 2D canvas context")
      ctx.drawImage(v, 0, 0, w, h)

      // 2) fetch live telescope coords at click time
      let status = null
      try {
        status = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/telescope/status`).then(r=>r.json())
      } catch (e) {
        console.warn("Could not fetch telescope status:", e)
        // Continue anyway, just without coordinates
      }

      // 3) turn canvas into blob
      const blob: Blob | null = await new Promise((resolve) => canvas!.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("Failed to convert frame to PNG")

      // 4) prepare form data
      const form = new FormData()
      const fileName = `snapshot_${new Date().toISOString().replace(/[:.]/g,"-")}.png`
      form.append("file", blob, fileName)
      form.append("objectName", selectedObjectName || "Unknown")
      form.append("timestamp", new Date().toISOString())
      if (status) {
        if (status.ra != null) form.append("ra", String(status.ra))
        if (status.dec != null) form.append("dec", String(status.dec))
        if (status.alt != null) form.append("alt", String(status.alt))
        if (status.az != null) form.append("az", String(status.az))
      }

      // 5) upload
      const res = await apiService.uploadCapture(form)
      setLastDownloadUrl(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}${res.downloadUrl}`)
      setMessage({ type: "success", text: "Snapshot captured successfully!" })

      // 6) optionally auto-download immediately:
      const a = document.createElement("a")
      a.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}${res.downloadUrl}`
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()

      // 7) notify parent component
      if (onCaptureSuccess) {
        onCaptureSuccess()
      }

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      console.error("Snapshot capture failed:", e)
      const errorMsg = (e as Error).message || "Snapshot failed. Please try again."
      setMessage({ type: "error", text: errorMsg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={capture}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 transition-colors flex items-center gap-2"
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Capturing…</span>
            </>
          ) : (
            <>
              <span>Snapshot</span>
            </>
          )}
        </button>
        {lastDownloadUrl && (
          <a
            className="text-sm underline text-slate-300 hover:text-slate-100 transition-colors"
            href={lastDownloadUrl}
            download
          >
            Download last capture
          </a>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
            message.type === "success"
              ? "bg-green-900/30 border border-green-700/50 text-green-300"
              : "bg-red-900/30 border border-red-700/50 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}

export default SnapshotCapture
