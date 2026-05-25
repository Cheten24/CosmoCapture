import { useEffect, useRef } from "react";

export default function PhoneCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    startCamera();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full bg-black rounded-lg"
    />
  );
}
