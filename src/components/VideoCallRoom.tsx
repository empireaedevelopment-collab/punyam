"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useJoin,
  useIsConnected,
  useRemoteUsers,
  useVolumeLevel,
  RemoteUser,
  LocalVideoTrack
} from "agora-rtc-react";
import type { ILocalAudioTrack, IRemoteAudioTrack } from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, AlertTriangle, Volume2 } from "lucide-react";

const CALL_DURATION_SECONDS = 30 * 60;

type TokenState =
  | { status: "loading" }
  | { status: "ready"; token: string; uid: number }
  | { status: "error"; message: string; detail?: string; fix?: string };

/** Turns an Agora SDK error into something a customer can act on. */
function describeDeviceError(error: unknown, device: "camera" | "microphone"): string {
  const rtcError = (error as { rtcError?: unknown } | null)?.rtcError;
  const asObject = rtcError as { code?: string; message?: string } | undefined;
  const haystack = [
    typeof rtcError === "string" ? rtcError : "",
    asObject?.code ?? "",
    asObject?.message ?? "",
    (error as Error | null)?.message ?? "",
  ]
    .join(" ")
    .toUpperCase();

  const label = device === "camera" ? "Camera" : "Microphone";

  if (haystack.includes("PERMISSION_DENIED") || haystack.includes("NOTALLOWED")) {
    return `${label} access was blocked. Allow it from the icon in your browser address bar, then reload.`;
  }
  if (haystack.includes("DEVICE_NOT_FOUND") || haystack.includes("NOTFOUND")) {
    return `No ${device} was found on this device.`;
  }
  if (
    haystack.includes("NOT_READABLE") ||
    haystack.includes("NOTREADABLE") ||
    haystack.includes("TRACK_IS_DISABLED")
  ) {
    return `Your ${device} is being used by another app. Close it and reload.`;
  }
  return `Could not start your ${device}.`;
}

/**
 * Live microphone level meter.
 *
 * This is the fastest way to tell where audio is breaking:
 *  - "You" bar moves when you speak  -> your mic works and is being captured
 *  - "Astrologer" bar moves          -> their audio IS arriving, so silence
 *                                       means a speaker/volume problem here
 *  - "Astrologer" bar flat at 0      -> they are not sending audio at all
 */
function AudioMeter({ label, track, missingNote }: {
  label: string;
  track: ILocalAudioTrack | IRemoteAudioTrack | undefined;
  missingNote: string;
}) {
  const level = useVolumeLevel(track);
  // Normal speech sits well below 1.0, so amplify to make the bar readable.
  const pct = Math.max(0, Math.min(100, Math.round(level * 250)));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#ddd' }}>
      <span style={{ width: '62px', flexShrink: 0 }}>{label}</span>
      {track ? (
        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct > 4 ? '#8ba145' : '#666', transition: 'width 0.1s linear' }} />
        </div>
      ) : (
        <span style={{ color: '#ff8a8a' }}>{missingNote}</span>
      )}
    </div>
  );
}

// The actual call component that runs inside the provider
function CallInterface({ channelName, appId }: { channelName: string, appId: string }) {
  const client = useRTCClient();

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Timer logic (30 minutes)
  const [timeLeft, setTimeLeft] = useState(CALL_DURATION_SECONDS);
  const [isExtending, setIsExtending] = useState(false);
  // Derived, not stored: extending the call resets timeLeft, which clears this too.
  const isTimeUp = timeLeft === 0;

  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });
  const [tokenAttempt, setTokenAttempt] = useState(0);

  // Which devices this machine actually has. `null` means "not checked yet".
  // enumerateDevices() does not prompt for permission, so we use it to avoid ever
  // asking the SDK for a track that cannot exist - which is what produced the
  // repeated DEVICE_NOT_FOUND errors.
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [hasMic, setHasMic] = useState<boolean | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Browsers refuse to play audio until the page has been clicked. Opening the
  // call URL directly counts as no interaction, so the remote audio is silently
  // dropped and the call looks connected but mute. The SDK tells us when this
  // happens; all we need is one click anywhere to release the queued playback.
  useEffect(() => {
    AgoraRTC.onAutoplayFailed = () => setAutoplayBlocked(true);
    return () => {
      AgoraRTC.onAutoplayFailed = undefined;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const detect = () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setHasCamera(false);
        setHasMic(false);
        return;
      }
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          if (cancelled) return;
          setHasCamera(devices.some(d => d.kind === "videoinput"));
          setHasMic(devices.some(d => d.kind === "audioinput"));
        })
        .catch(() => {
          if (cancelled) return;
          setHasCamera(false);
          setHasMic(false);
        });
    };

    detect();
    // Recover automatically if a webcam or headset is plugged in mid-call.
    navigator.mediaDevices?.addEventListener?.("devicechange", detect);
    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener?.("devicechange", detect);
    };
  }, []);

  // Fetch the RTC token from our own route. The Agora project has an App Certificate
  // enabled, so a token is mandatory - joining with the App ID alone is rejected with
  // "dynamic use static key".
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch("/api/agora/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, uid: 0 }),
      signal: controller.signal,
    })
      .then(async res => {
        const data: Record<string, unknown> = await res
          .json()
          .catch(() => ({} as Record<string, unknown>));
        if (cancelled) return;

        if (res.ok && typeof data.token === "string" && data.token.length > 0) {
          const uid = typeof data.uid === "number" ? data.uid : 0;
          setTokenState({ status: "ready", token: data.token, uid });
          return;
        }

        setTokenState({
          status: "error",
          message:
            typeof data.error === "string"
              ? data.error
              : `Could not get an Agora token (HTTP ${res.status}).`,
          detail: typeof data.detail === "string" ? data.detail : undefined,
          fix: typeof data.fix === "string" ? data.fix : undefined,
        });
      })
      .catch(err => {
        if (cancelled || err?.name === "AbortError") return;
        setTokenState({
          status: "error",
          message: "Could not reach the server to start the call.",
          detail: err instanceof Error ? err.message : String(err),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [channelName, tokenAttempt]);

  // Nothing connects until the customer clicks "Join consultation". That click
  // is what lets the browser play the astrologer's audio - see the lobby below.
  const [hasEntered, setHasEntered] = useState(false);
  const canJoin = tokenState.status === "ready" && hasEntered;

  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: canJoin ? tokenState.token : null,
      uid: canJoin ? tokenState.uid : 0,
    },
    canJoin
  );

  const isConnected = useIsConnected();

  // Always attempt the microphone. enumerateDevices() can fail to report an
  // audioinput before permission is granted in some browsers, and gating on it
  // would silently leave a consultation with no audio at all. A camera is
  // optional, so that one stays gated to avoid the DEVICE_NOT_FOUND errors.
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(canJoin);
  const { localCameraTrack, error: cameraError } = useLocalCameraTrack(canJoin && hasCamera === true);

  const tracksToPublish = useMemo(
    () =>
      [localMicrophoneTrack, localCameraTrack].filter(
        (t): t is NonNullable<typeof t> => t !== null && t !== undefined
      ),
    [localMicrophoneTrack, localCameraTrack]
  );
  usePublish(tracksToPublish, isConnected && tracksToPublish.length > 0);

  const remoteUsers = useRemoteUsers();

  const cameraUnavailable = hasCamera === false || Boolean(cameraError);
  // The mic is attempted regardless, so only a real failure counts.
  const micUnavailable = Boolean(micError) || (localMicrophoneTrack === null && hasMic === false);

  // The astrologer is connected but publishing no audio.
  const remoteMicOff = remoteUsers.length > 0 && remoteUsers.every(u => !u.hasAudio);

  const deviceWarning = useMemo(() => {
    // Audio problems come first - a consultation is unusable without them.
    if (micError) return describeDeviceError(micError, "microphone");
    if (remoteMicOff) return "The astrologer's microphone is off - they cannot be heard.";
    if (cameraError) return describeDeviceError(cameraError, "camera");
    if (hasCamera === false) return "No camera was found - joining with audio only.";
    return null;
  }, [cameraError, micError, hasCamera, remoteMicOff]);

  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setMuted(!micOn);
    }
  }, [micOn, localMicrophoneTrack]);

  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setMuted(!cameraOn);
    }
  }, [cameraOn, localCameraTrack]);

  // Timer countdown - only starts once we are actually in the call, so a failed
  // connection does not silently burn the customer 30 minutes.
  useEffect(() => {
    if (!isConnected || isTimeUp) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected, isTimeUp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEndCall = useCallback(async () => {
    try {
      // Close the tracks explicitly so the camera light goes off right away - we
      // navigate with a full page load, so unmount cleanup may not run.
      localCameraTrack?.close();
      localMicrophoneTrack?.close();
      await client.leave();
    } catch (err) {
      console.error("Error while leaving the call", err);
    }
    window.location.href = "/";
  }, [client, localCameraTrack, localMicrophoneTrack]);

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      // In a real app, you would create a new Razorpay order here for extension
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500, bookingId: `EXT_${channelName}` })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error("Payment order failed");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Punyam Consultation",
        description: "30 Mins Call Extension",
        order_id: orderData.orderId,
        theme: { color: "#8ba145" },
        handler: function () {
          // Payment successful! Give 30 more minutes. Resetting the clock also
          // clears isTimeUp, which is derived from it.
          setTimeLeft(CALL_DURATION_SECONDS);
          setIsExtending(false);
        },
        modal: {
          ondismiss: function () {
            setIsExtending(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Call extension failed", err);
      alert("Could not process extension. Ending call.");
      handleEndCall();
    }
  };

  // Without a token there is nothing to join, so explain why instead of letting the
  // SDK hammer the gateway and fail.
  if (tokenState.status === "error") {
    return (
      <div style={{ width: '100%', minHeight: '75vh', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ maxWidth: '520px', textAlign: 'center', color: '#fff' }}>
          <AlertTriangle size={40} color="#ff4444" style={{ marginBottom: '16px' }} />
          {/* Explicit colour: globals.css sets a dark colour on all headings. */}
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontFamily: 'var(--font-playfair)', color: '#fff' }}>Unable to start the call</h2>
          <p style={{ color: '#bbb', lineHeight: 1.6, marginBottom: '16px' }}>
            {tokenState.message}
          </p>
          {tokenState.fix && (
            <p style={{ color: '#8ba145', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>{tokenState.fix}</p>
          )}
          {tokenState.detail && (
            <p style={{ color: '#777', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px', wordBreak: 'break-word' }}>
              {tokenState.detail}
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button
              onClick={() => {
                setTokenState({ status: "loading" });
                setTokenAttempt(n => n + 1);
              }}
              style={{ padding: '12px 24px', background: '#8ba145', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // A deliberate "Join" click before anything connects. Browsers only let a
  // page play audio after the user has interacted with it, and arriving here
  // from a link counts as no interaction - so without this click the
  // astrologer's audio is silently blocked while their video plays fine.
  if (!hasEntered) {
    const ready = tokenState.status === "ready";
    return (
      <div style={{ width: '100%', minHeight: '75vh', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ maxWidth: '460px', textAlign: 'center', color: '#fff' }}>
          <Volume2 size={40} color="#8ba145" style={{ marginBottom: '16px' }} />
          {/* Explicit colour: globals.css sets a dark colour on all headings. */}
          <h2 style={{ fontSize: '24px', marginBottom: '12px', fontFamily: 'var(--font-playfair)', color: '#fff' }}>Ready to join?</h2>
          <p style={{ color: '#bbb', lineHeight: 1.6, marginBottom: '8px' }}>
            Your microphone and camera turn on when you join. Allow access if your browser asks.
          </p>
          <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6, marginBottom: '28px' }}>
            Turn your volume up. Headphones give the clearest sound and prevent echo.
          </p>
          <button
            onClick={() => setHasEntered(true)}
            disabled={!ready}
            style={{ padding: '14px 32px', background: ready ? '#8ba145' : '#444', color: '#fff', border: 'none', borderRadius: '10px', cursor: ready ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '16px' }}
          >
            {ready ? "Join consultation" : "Preparing your room..."}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '75vh', backgroundColor: '#111', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

      {/* Top-left overlays, stacked in one column so they can never overlap.
          The warning used to be capped at "width minus 340px", which left it
          35px wide on a phone. */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', pointerEvents: 'none' }}>
        {/* Timer */}
        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)' }}>
          <Clock size={18} color={timeLeft < 300 ? '#ff4444' : '#fff'} />
          <span style={{ fontWeight: 600, fontSize: '18px', color: timeLeft < 300 ? '#ff4444' : 'white' }}>{formatTime(timeLeft)}</span>
        </div>

        {/* Device warning - non-blocking, the call still works without a camera */}
        {deviceWarning && (
          <div style={{ background: 'rgba(255,68,68,0.9)', padding: '10px 16px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', maxWidth: 'min(520px, 100%)' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{deviceWarning}</span>
          </div>
        )}

        {/* Audio check - shows immediately which side the audio is failing on */}
        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 14px', borderRadius: '12px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <span style={{ fontSize: '10px', color: '#999', letterSpacing: '0.06em' }}>AUDIO CHECK</span>
          <AudioMeter
            label="You"
            track={localMicrophoneTrack ?? undefined}
            missingNote="mic not started"
          />
          <AudioMeter
            label="Astrologer"
            track={remoteUsers[0]?.audioTrack}
            missingNote={remoteUsers.length === 0 ? "not joined" : "not sending audio"}
          />
        </div>
      </div>

      {/* Browser blocked audio playback - one click releases it */}
      {autoplayBlocked && (
        <div
          onClick={() => {
            setAutoplayBlocked(false);
            // Replay inside the click itself, so the browser counts it as
            // user-initiated instead of relying on the SDK to notice.
            remoteUsers.forEach(user => { user.audioTrack?.play(); });
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ textAlign: 'center', color: '#fff', padding: '32px' }}>
            <Volume2 size={44} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#fff' }}>Tap to enable sound</h3>
            <p style={{ color: '#bbb', fontSize: '14px', maxWidth: '340px', lineHeight: 1.6 }}>
              Your browser blocked audio until you interact with the page. Tap anywhere to hear the astrologer.
            </p>
          </div>
        </div>
      )}

      {/* Main Video Area */}
      <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', filter: isTimeUp ? 'blur(16px)' : 'none', transition: 'filter 0.5s ease' }}>

        {/* Remote Videos (Astrologer) */}
        {remoteUsers.map(user => (
          <div key={user.uid} style={{ flex: 1, minWidth: 'min(300px, 100%)', height: '100%', position: 'relative' }}>
            <RemoteUser user={user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 126, left: 16, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', backdropFilter: 'blur(10px)' }}>
              Astrologer
            </div>
          </div>
        ))}

        {remoteUsers.length === 0 && (
          <div style={{ flex: 1, minWidth: 'min(300px, 100%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', background: '#1a1a1a' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #333', borderTopColor: '#c19b63', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <p>{isConnected ? "Waiting for Astrologer to join..." : "Connecting to the consultation room..."}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Local Video (Floating or split if multiple) */}
        <div style={{
          position: 'absolute',
          // Sits above the control bar (30px up, ~84px tall); shrinks on phones.
          bottom: 126,
          right: 16,
          width: 'min(200px, 30vw)',
          aspectRatio: '5 / 7',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
          zIndex: 5
        }}>
          {localCameraTrack && cameraOn ? (
            <LocalVideoTrack track={localCameraTrack} play={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666', gap: '8px', padding: '12px', textAlign: 'center', fontSize: '13px' }}>
               <VideoOff size={22} />
               <span>{cameraUnavailable ? "No camera" : "Camera Off"}</span>
             </div>
          )}
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>You</div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.8)', padding: '16px 32px', borderRadius: '50px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => setMicOn(!micOn)}
          disabled={micUnavailable}
          title={micUnavailable ? "No microphone available" : micOn ? "Mute" : "Unmute"}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: micUnavailable ? 'rgba(255,255,255,0.05)' : micOn ? 'rgba(255,255,255,0.1)' : '#ff4444', color: micUnavailable ? '#666' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: micUnavailable ? 'not-allowed' : 'pointer', transition: '0.2s' }}
        >
          {micOn && !micUnavailable ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button
          onClick={() => setCameraOn(!cameraOn)}
          disabled={cameraUnavailable}
          title={cameraUnavailable ? "No camera available" : cameraOn ? "Turn camera off" : "Turn camera on"}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: cameraUnavailable ? 'rgba(255,255,255,0.05)' : cameraOn ? 'rgba(255,255,255,0.1)' : '#ff4444', color: cameraUnavailable ? '#666' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: cameraUnavailable ? 'not-allowed' : 'pointer', transition: '0.2s' }}
        >
          {cameraOn && !cameraUnavailable ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <div style={{ width: '1px', height: '52px', background: 'rgba(255,255,255,0.2)' }} />
        <button onClick={handleEndCall} style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: '#ff4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Time Up Overlay */}
      {isTimeUp && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 'clamp(20px, 6vw, 40px)', margin: '0 16px', borderRadius: '24px', textAlign: 'center', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#222', fontFamily: 'var(--font-playfair)' }}>Time&apos;s Up!</h2>
            <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' }}>
              Your 30-minute consultation has ended. Would you like to extend the call for another 30 minutes?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              <button onClick={handleEndCall} className="btn" style={{ background: '#f5f5f5', color: '#333', padding: '14px 24px', fontWeight: 600 }}>End Call</button>
              <button onClick={handleExtend} disabled={isExtending} className="btn btn-primary" style={{ padding: '14px 24px', fontWeight: 600 }}>
                {isExtending ? "Processing..." : "Extend 30 Mins (₹500)"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function VideoCallRoom({ channelName, appId }: { channelName: string, appId: string }) {
  const [client] = useState(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));

  return (
    <AgoraRTCProvider client={client}>
      <CallInterface channelName={channelName} appId={appId} />
    </AgoraRTCProvider>
  );
}
