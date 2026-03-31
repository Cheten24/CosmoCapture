// src/lib/whep.ts
export async function startWhep(videoEl: HTMLVideoElement, whepUrl: string) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  });

  // receive-only
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  // attach tracks
  const ms = new MediaStream();
  pc.ontrack = (e) => {
    ms.addTrack(e.track);
    if (videoEl.srcObject !== ms) videoEl.srcObject = ms;
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // wait for ICE gathering complete (no trickle)
  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const onchg = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", onchg);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", onchg);
    setTimeout(resolve, 2500);
  });

  const res = await fetch(whepUrl, {
    method: "POST",
    // Both headers help with some servers/proxies
    headers: {
      "Content-Type": "application/sdp",
      "Accept": "application/sdp",
    },
    body: pc.localDescription?.sdp ?? "",
    mode: "cors",
  });

  // ⬇️ show server's error text (so we see the real reason)
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    pc.close();
    throw new Error(`WHEP POST failed: ${res.status} ${res.statusText}${errText ? ` — ${errText}` : ""}`);
  }

  const answerSdp = await res.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  videoEl.muted = true;
  await videoEl.play().catch(() => {});
  return () => pc.close();
}
