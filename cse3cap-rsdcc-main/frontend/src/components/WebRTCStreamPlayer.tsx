"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSafety } from "../contexts/SafetyContext"

type Props = {
  whepUrl: string
  label?: string
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

type Status = "idle" | "connecting" | "playing" | "paused" | "error"

export default function WebRTCStreamPlayer({ whepUrl, label, videoRef }: Props) {
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef ?? internalVideoRef

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const resourceRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const connectTimeoutRef = useRef<number | null>(null)

  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  // Safety status for controlling streaming
  const { safetyStatus } = useSafety()
  const safetyRef = useRef(safetyStatus)
  useEffect(() => {
    safetyRef.current = safetyStatus
  }, [safetyStatus])

  useEffect(() => {
    console.log("[webrtc] init:", whepUrl)
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whepUrl])


  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const startOnce = useCallback(async () => {
    if (pcRef.current) return
    
    // Check safety status before starting
    const s = safetyRef.current
    if (s && s.status !== 'ACTIVE') {
      console.log("[webrtc] Cannot start stream - safety status is", s.status)
      setStatus("error")
      setErrorMessage(`Streaming not allowed - ${s.reason || 'System not active'}`)
      return
    }
    
    setStatus("connecting")
    setErrorMessage("")
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    console.log("[webrtc] start ->", whepUrl)

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })
      pcRef.current = pc

      // Set up connection timeout (only while connecting)
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = window.setTimeout(() => {
        if (pcRef.current === pc) {
          console.log("[WebRTC] Connection timeout")
          stop()
          setStatus("error")
          setErrorMessage("Connection timeout")
        }
      }, 30000)

      const mediaStream = new MediaStream()
      streamRef.current = mediaStream

      pc.addTransceiver("video", { direction: "recvonly" })
      pc.addTransceiver("audio", { direction: "recvonly" })

      pc.ontrack = (ev) => {
        console.log("[webrtc] track:", ev.track.kind)
        mediaStream.addTrack(ev.track)
        const v = actualVideoRef.current
        if (v && v.srcObject !== mediaStream) {
          v.srcObject = mediaStream
        }
      }

      // Diagnostics
      pc.onconnectionstatechange = () => {
        console.log("[webrtc] pc.connectionState:", pc.connectionState)
        if (pc.connectionState === "connected") {
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
          }
          setStatus("playing")
        }
      }
      pc.oniceconnectionstatechange = () => {
        console.log("[webrtc] pc.iceConnectionState:", pc.iceConnectionState)
        if (pc.iceConnectionState === "connected") {
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current)
            connectTimeoutRef.current = null
          }
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for full ICE gathering (no trickle to WHEP)
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve()
        
        const onState = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", onState)
            resolve()
          }
        }
        pc.addEventListener("icegatheringstatechange", onState)
        setTimeout(resolve, 2500) // safety timeout
      })

      // POST offer to WHEP endpoint
      console.log("[webrtc] WHEP POST ->", whepUrl)
      const res = await fetch(whepUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription?.sdp ?? "",
        signal: abortRef.current?.signal,
      })

      if (!res.ok) {
        const errorText = `WHEP POST failed: ${res.status} ${res.statusText}`
        console.error("[webrtc]", errorText)
        throw new Error(errorText)
      }

      const loc = res.headers.get("Location") ?? res.headers.get("location")
      if (!loc) throw new Error("WHEP missing Location header")

      // IMPORTANT: make the resource absolute against the WHEP origin (e.g. http://localhost:8889)
      resourceRef.current = new URL(loc, whepUrl).toString()
      console.log("[webrtc] WHEP resource:", resourceRef.current)

      const answerSdp = await res.text()
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })

      // Auto-play (must be muted)
      const v = actualVideoRef.current
      if (v) {
        v.muted = true
        v.playsInline = true
        const onCanPlay = () => {
          v.play().catch(() => {})
          v.removeEventListener("loadedmetadata", onCanPlay)
          v.removeEventListener("canplay", onCanPlay)
        }
        v.addEventListener("loadedmetadata", onCanPlay)
        v.addEventListener("canplay", onCanPlay)

        const onError = () => {
          console.warn("[webrtc] <video> error event")
          v.removeEventListener("error", onError)
        }
        v.addEventListener("error", onError)
      }

      setStatus("playing")
      console.log("[webrtc] connected")
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error("[webrtc] start failed:", errMsg)
      setErrorMessage(errMsg)
      setStatus("error")
      throw error
    }
  }, []) // ✅ stable identity - no dependencies

  // Retry/backoff wrapper
  const startWithRetry = useCallback(
    async (max = 5) => {
      let delay = 500
      for (let i = 0; i < max; i++) {
        try {
          await startOnce()
          return
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return
          await sleep(delay + Math.floor(Math.random() * 200))
          delay = Math.min(delay * 2, 5000)
        }
      }
      setStatus("error")
    },
    [] // ✅ stable identity - no dependencies
  )





  const stop = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    abortRef.current?.abort()
    abortRef.current = null

    if (resourceRef.current) {
      const url = resourceRef.current
      resourceRef.current = null
      // Now absolute to :8889 → no more 405 from :5173
      fetch(url, { method: "DELETE" }).catch(() => {})
    }

    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const v = actualVideoRef.current
    if (v) v.srcObject = null

    try {
      pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop())
      pcRef.current?.close()
    } catch {/* ignore */}
    pcRef.current = null

    setStatus("idle")
  }, []) // ✅ stable identity - no dependencies

  // Stop streaming when safety status is not ACTIVE
  useEffect(() => {
    if (safetyStatus && safetyStatus.status !== 'ACTIVE' && status !== 'idle') {
      console.log("[webrtc] Safety status changed to", safetyStatus.status, "- stopping stream")
      stop()
      setStatus("idle")
      setErrorMessage("Streaming stopped - system not active")
    }
  }, [safetyStatus?.status, status, stop])

  async function reconnect() {
    console.log("[webrtc] reconnect()")
    stop()
    await startWithRetry(4)
  }

  useEffect(() => {
    startWithRetry(5)
    return () => stop()
  }, [whepUrl]) // ✅ Only depend on URL changes



  return (
    <div className="w-full h-full flex flex-col">
      <video
        ref={actualVideoRef}
        className="w-full h-full bg-black rounded-lg"
        muted
        playsInline
        autoPlay
      />
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="opacity-70">
            {label ?? "WebRTC"} · {status}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={reconnect}
              disabled={status === "connecting"}
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>
        {status === "error" && errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
            <strong>Error:</strong> {errorMessage}
            <br />
            <span className="opacity-70">WHEP URL: {whepUrl}</span>
            <br />
            <span className="opacity-70">
              Ensure MediaMTX is running, the path is publishing, and WHEP/HLS ports are open.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
