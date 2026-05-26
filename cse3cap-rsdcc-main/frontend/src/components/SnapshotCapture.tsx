import { useRef, useState } from "react"
import { Loader2, Check, AlertCircle, Camera } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase"

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
  selectedObjectName?: string
  onCaptureSuccess?: () => void
}

export default function SnapshotCapture({
  videoRef,
  selectedObjectName,
  onCaptureSuccess,
}: Props) {
  const [busy, setBusy] = useState(false)

  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const capture = async () => {
    setBusy(true)
    setMessage(null)

    try {
      const video = videoRef.current

      if (!video) throw new Error("No video element found.")

      if (video.readyState < 2)
        throw new Error("Video stream is not ready yet.")

      if (video.videoWidth === 0 || video.videoHeight === 0)
        throw new Error("Video has no valid dimensions.")

      const canvas = canvasRef.current!

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("Could not get canvas context.")

      ctx.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/png")

      await addDoc(collection(db, "captures"), {
        image: imageData,
        objectName: selectedObjectName || "Unknown",
        createdAt: new Date().toISOString(),
      })

      setLastDownloadUrl(imageData)

      setMessage({
        type: "success",
        text: "Snapshot captured successfully!",
      })

      if (onCaptureSuccess) onCaptureSuccess()

      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      const errorMsg = (e as Error).message || "Snapshot failed."

      setMessage({
        type: "error",
        text: errorMsg,
      })

      setTimeout(() => setMessage(null), 5000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-3">
        <button
          onClick={capture}
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Capturing...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Snapshot</span>
            </>
          )}
        </button>

        {lastDownloadUrl && (
          <a
            href={lastDownloadUrl}
            download="snapshot.png"
            className="text-sm underline text-slate-300 hover:text-slate-100 transition-colors"
          >
            Download last capture
          </a>
        )}
      </div>

      {message && (
        <div
          className={
            "flex items-center gap-2 text-sm px-4 py-2 rounded-lg " +
            (message.type === "success"
              ? "bg-green-900/30 border border-green-700/50 text-green-300"
              : "bg-red-900/30 border border-red-700/50 text-red-300")
          }
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