import { useEffect, useRef, useState } from "react"

export default function PhoneCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Camera access error:", error)
        setMessage("Camera access failed.")
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const captureImage = async () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement("canvas")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL("image/png")

    try {
      const response = await fetch("http://127.0.0.1:5000/api/captures/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Image saved successfully.")
      } else {
        setMessage("Image save failed.")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      setMessage("Image upload failed.")
    }
  }

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return

    const stream = videoRef.current.srcObject as MediaStream
    recordedChunksRef.current = []

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = async () => {
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      })

      const formData = new FormData()
      formData.append("video", videoBlob, `recording-${Date.now()}.webm`)

      try {
        const response = await fetch("http://127.0.0.1:5000/api/captures/video", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          setMessage("Video saved successfully.")
        } else {
          setMessage("Video save failed.")
        }
      } catch (error) {
        console.error("Video upload error:", error)
        setMessage("Video upload failed.")
      }
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsRecording(true)
    setMessage("Recording started.")
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    setMessage("Recording stopped. Saving video...")
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {isRecording && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold">
            ● Recording
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={captureImage}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
        >
          Capture Image
        </button>

        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
          >
            Stop Recording
          </button>
        )}
      </div>

      {message && (
        <p className="text-sm text-slate-300 mt-3">
          {message}
        </p>
      )}
    </div>
  )
}