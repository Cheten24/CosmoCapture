import { useRef, useState } from "react"
import { Loader2, Check, AlertCircle, Camera } from "lucide-react"
import { apiService } from "../services/api"

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  selectedObjectName?: string
  onCaptureSuccess?: () => void
}

export default function SnapshotCapture({ videoRef, selectedObjectName, onCaptureSuccess }: Props) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const capture = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const video = videoRef.current
      if (!video) throw new Error("No video element found.")
      if (video.readyState < 2) throw new Error("Video stream is not ready yet.")
      if (video.videoWidth === 0 || video.videoHeight === 0) throw new Error("Video has no valid dimensions.")
      const canvas = canvasRef.current!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context.")
      ctx.drawImage(video, 0, 0)
      let status = null
      try {
        status = await apiService.getTelescopeStatus()
      } catch (e) {
        console.warn("Could not fetch telescope status:", e)
      }
      const blob: Blob | null = await new Pr
import { useRef, useState } from "react"
import { Loader2, Check, AlertCircle, Camera } from "lucide-react"
import { apiService } from "../services/api"

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  selectedObjectName?: string
  onCaptureSuccess?: () => void
}

export default function SnapshotCapture({ videoRef, selectedObjectName, onCaptureSuccess }: Props) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const capture = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const video = videoRef.current
      if (!video) throw new Error("No video element found.")
      if (video.readyState < 2) throw new Error("Video stream is not ready yet.")
      if (video.videoWidth === 0 || video.videoHeight === 0) throw new Error("Video has no valid dimensions.")
      const canvas = canvasRef.current!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context.")
      ctx.drawImage(video, 0, 0)
      let status = null
      try {
        status = await apiService.getTelescopeStatus()
      } catch (e) {
        console.warn("Could not fetch telescope status:", e)
      }
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("Failed to convert frame to PNG.")
      const form = new FormData()
      const fileName = `snapshot_${new Date().toISOString().replace(/[:.]/g, "-")}.png`
      form.append("file", blob, fileName)
      form.append("objectName", selectedObjectName || "Unknown")
      form.append("timestamp", new Date().toISOString())
      if (status) {
        if (status.ra != null) form.append("ra", String(status.ra))
        if (status.dec != null) form.append("dec", String(status.dec))
        if (status.alt != null) form.append("alt", String(status.alt))
        if (status.az != null) form.append("az", String(status.az))
      }
      const res = await apiService.uploadCapture(form)
      const downloadUrl = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}${res.downloadUrl}`
      setLastDownloadUrl(downloadUrl)
      setMessage({ type: "success", text: "Snapshot captured successfully!" })
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      if (onCaptureSuccess) onCaptureSuccess()
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      const errorMsg = (e as Error).message || "Snapshot failed. Please try again."
      setMessage({ type: "error", text: errorMsg })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex items-center gap-3">
        <button onClick={capture} disabled={busy} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 transition-colors flex items-center gap-2">
          {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Capturing...</span></>) : (<><Camera className="h-4 w-4" /><span>Snapshot</span></>)}
        </button>
        {lastDownloadUrl && (
          <a href={lastDownloadUrl} download className="text-sm underline text-slate-300 hover:text-slate-100 transition-colors">
            Download last capture
          </a>
        )}
      </div>
      {message && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${message.type === "success" ? "bg-green-900/30 border border-green-700/50 text-green-300" : "bg-red-900/30 border border-red-700/50 text-red-300"}`}>
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}
