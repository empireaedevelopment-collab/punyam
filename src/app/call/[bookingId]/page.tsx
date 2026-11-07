"use client";
import React, { use } from "react";
import dynamic from "next/dynamic";

const API_BASE = "https://punyam.pythonanywhere.com";

// Dynamically import the VideoCallRoom component to disable SSR completely
// This is critical because Agora SDK relies heavily on browser-only APIs (window, navigator)
const VideoCallRoom = dynamic(() => import("../../../components/VideoCallRoom"), {
  ssr: false,
  loading: () => (
    <div style={{ height: '75vh', width: '100%', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading Video Interface...
    </div>
  )
});

type CallGate =
  | { status: "checking" }
  | { status: "blocked"; title: string; message: string; canRetry?: boolean }
  | { status: "ready"; channelName: string; expectedChannel: string };

export default function CallPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  const [gate, setGate] = React.useState<CallGate>({ status: "checking" });

  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const resolve = async () => {
      // ---- 1. Load the booking and enforce the scheduled slot ----------------
      let booking: Record<string, any> | null = null;

      try {
        const res = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(bookingId)}/`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          // The booking genuinely does not exist - do not hand out a room.
          if (!cancelled) {
            setGate({
              status: "blocked",
              title: "Booking not found",
              message: "We could not find this consultation. Please open the call from your dashboard, or contact support with your booking reference.",
            });
          }
          return;
        }

        if (res.ok) booking = await res.json();
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.warn("Booking lookup failed", err);
      }

      // The time rule is enforced by the backend (step 2), using the server's
      // clock. We used to also check it here with the browser clock, which
      // could wrongly block someone whose device clock or timezone is off.

      // Without the booking we cannot ask the backend for a room - it needs the
      // astrologer and user ids - so there is nothing safe to join.
      if (!booking || booking.astrologer == null || booking.user == null) {
        if (!cancelled) {
          setGate({
            status: "blocked",
            title: "We couldn't open your call room",
            message: "We could not load this consultation right now. Please check your connection and try again.",
            canRetry: true,
          });
        }
        return;
      }

      // ---- 2. Ask the backend for the call room ------------------------------
      // /api/video/initiate/ is the single source of truth. It enforces the
      // booked time window (HTTP 403 outside it) and returns the channel the
      // astrologer's panel joins. It is idempotent per booking, so calling it on
      // every visit is safe - it just hands back the existing room.
      //
      // We deliberately do NOT look up /api/video/session/ first: that endpoint
      // has no time check, so going through it let customers past the rule.
      let channelName: string | null = null;

      try {
        const res = await fetch(`${API_BASE}/api/video/initiate/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            astrologer_id: booking.astrologer,
            user_id: booking.user,
            booking_id: bookingId,
          }),
          signal: controller.signal,
        });

        const data: Record<string, unknown> = await res.json().catch(() => ({}));

        if (res.ok) {
          if (typeof data.channel_name === "string" && data.channel_name) {
            channelName = data.channel_name;
          }
        } else if (res.status >= 400 && res.status < 500) {
          // The backend refused - e.g. "Please join at the correct time".
          // Show its reason and do not join.
          if (!cancelled) {
            setGate({
              status: "blocked",
              title: typeof data.error === "string" ? data.error : "You can't join this call right now",
              message: typeof data.message === "string"
                ? data.message
                : "This consultation cannot be joined at the moment.",
              // Early arrivals only need to wait, so let them check again.
              canRetry: res.status === 403,
            });
          }
          return;
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.warn("Could not initiate the video session", err);
      }

      // A server error or network failure means we could not confirm the time
      // window, so don't guess - let the customer retry instead.
      if (!channelName) {
        if (!cancelled) {
          setGate({
            status: "blocked",
            title: "We couldn't open your call room",
            message: "Something went wrong setting up your consultation. Please try again in a moment.",
            canRetry: true,
          });
        }
        return;
      }

      if (!cancelled) {
        setGate({
          status: "ready",
          channelName,
          // The backend names a booking's channel `call_<booking id>`. Anything
          // else means the booking has more than one video session on the
          // server - surface it rather than leave both sides waiting.
          expectedChannel: `call_${bookingId}`,
        });
      }
    };

    resolve();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [bookingId]);

  if (!appId || appId === "your_agora_app_id_here") {
    return (
      <div className="container section-padding text-center" style={{ marginTop: '80px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>Video Call Setup Incomplete</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Please add your <strong>NEXT_PUBLIC_AGORA_APP_ID</strong> to your <code>.env.local</code> file to enable live video consultations.
        </p>
      </div>
    );
  }

  if (gate.status === "checking") {
    return (
      <div className="container section-padding text-center" style={{ marginTop: '80px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Verifying booking details...</p>
      </div>
    );
  }

  if (gate.status === "blocked") {
    return (
      <div className="container section-padding text-center" style={{ marginTop: '80px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>{gate.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', lineHeight: '1.6' }}>
          {gate.message}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {gate.canRetry && (
            <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#8ba145', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Check again
            </button>
          )}
          <button onClick={() => window.location.href = "/"} style={{ padding: '12px 24px', background: gate.canRetry ? '#f0f0f0' : '#8ba145', color: gate.canRetry ? '#333' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ marginTop: '80px', minHeight: '80vh' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-playfair)', marginBottom: '4px' }}>Consultation Room</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Booking Reference: {bookingId}</p>
          {/* Both sides must show the same room for the call to connect. */}
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', opacity: 0.7 }}>Room: {gate.channelName}</p>
          {gate.channelName !== gate.expectedChannel && (
            <p style={{ color: '#b45309', fontSize: '12px', marginTop: '6px', maxWidth: '620px', lineHeight: 1.5 }}>
              This booking has more than one video session on the server, so we were
              given an older room. The astrologer must join the row whose channel is
              exactly <strong>{gate.channelName}</strong> — not <strong>{gate.expectedChannel}</strong>.
              Ask the backend team to remove the duplicate sessions for this booking.
            </p>
          )}
        </div>
        <div style={{ background: '#f5f5f5', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>
          Secured by Agora
        </div>
      </div>

      {/*
        This renders our fully client-side Video Component.
        The channel comes from the backend's video session so the customer and
        the astrologer land in the exact same private room.
      */}
      <VideoCallRoom channelName={gate.channelName} appId={appId} />
    </div>
  );
}
