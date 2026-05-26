import { useEffect } from "react"

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export default function PhoneCamera({ videoRef }: Props) {

  useEffect(() => {

    async function startCamera() {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

      } catch (err) {

        console.error("Camera access denied:", err)
      }
    }

    startCamera()

  }, [videoRef])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full bg-black rounded-lg"
    />
  )
}