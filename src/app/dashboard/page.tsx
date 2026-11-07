"use client";

import { LayoutDashboard, FileText, Calendar as CalendarIcon, LogOut, Video } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  booking_reference?: string;
  consultation_type?: string;
  status?: string;
  amount?: string | number;
  duration_minutes?: number;
  created_at?: string;
  time_slot_details?: { date?: string; time?: string; start_time?: string } | null;
};

type CallWindow = { start: number; opens: number; end: number };

// The Join button appears this long before a scheduled call starts - the same
// grace period the backend allows.
const JOIN_OPENS_EARLY_MS = 5 * 60 * 1000;

// Bookings in any of these states are over and drop off the upcoming list.
const CLOSED_STATUSES = new Set(["completed", "ended", "cancelled", "canceled", "missed", "expired"]);

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const dateFormat = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/**
 * When a scheduled booking can be joined: from 5 minutes before the slot until
 * it ends. Slot times come without a timezone, so they are read as Indian time
 * rather than whatever timezone the customer's browser is in.
 *
 * Returns null for anything that is not a scheduled call with a time -
 * including old "Speak Now" bookings, which are no longer offered.
 */
function getCallWindow(booking: Booking): CallWindow | null {
  if (booking.consultation_type !== "book_call") return null;
  const slot = booking.time_slot_details;
  const time = slot?.time || slot?.start_time;
  if (!slot?.date || !time) return null;
  const start = Date.parse(`${slot.date}T${time}+05:30`);
  if (Number.isNaN(start)) return null;
  const lengthMs = (Number(booking.duration_minutes) || 30) * 60 * 1000;
  return { start, opens: start - JOIN_OPENS_EARLY_MS, end: start + lengthMs };
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  // Ticks every second, so a Join button appears by itself the moment its
  // window opens and a finished call drops off - no refresh needed.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const storedName = localStorage.getItem("user_name");

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (storedName) {
      setUserName(storedName);
    } else {
      // Attempt to fetch user profile if no name is cached
      fetch(`/api/backend/users/${userId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.first_name) {
            setUserName(data.first_name);
            localStorage.setItem("user_name", data.first_name);
          }
        })
        .catch(() => {});
    }

    fetch(`/api/backend/bookings?user=${userId}`)
      .then(res => res.ok ? res.json() : { results: [] })
      .then(data => {
        const list = data?.results || (Array.isArray(data) ? data : []);
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    window.location.href = "/";
  };

  // Only scheduled calls that have not finished yet, soonest first.
  const upcoming = bookings
    .filter(b => !CLOSED_STATUSES.has(String(b.status ?? "").toLowerCase()))
    .map(booking => ({ booking, win: getCallWindow(booking) }))
    .filter((item): item is { booking: Booking; win: CallWindow } => item.win !== null && item.win.end > now)
    .sort((a, b) => a.win.start - b.win.start);

  return (
    <div className="container section-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '40px', marginTop: '40px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 7vw, 36px)', color: '#222' }}>
          {userName ? `${userName}'s Dashboard` : 'My Dashboard'}
        </h1>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '20px' }}>

        {/* Saved Reports Card */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '25px', display: 'flex', gap: '15px' }}>
          <div style={{ background: 'rgba(193, 155, 99, 0.1)', color: '#c19b63', width: '50px', height: '50px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={24} />
          </div>
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>Saved Reports</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>View your previously generated Kundli PDFs.</p>
            <a href="#" style={{ color: '#c19b63', fontWeight: 600, fontSize: '14px' }}>View Reports →</a>
          </div>
        </div>

        {/* Consultations Card */}
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '25px', display: 'flex', gap: '15px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ background: 'rgba(193, 155, 99, 0.1)', color: '#c19b63', width: '50px', height: '50px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>Upcoming Consultations</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>
                {loading
                  ? 'Loading...'
                  : upcoming.length === 0
                    ? 'You have no upcoming calls.'
                    : `You have ${upcoming.length} upcoming ${upcoming.length === 1 ? 'call' : 'calls'}.`}
              </p>
            </div>
          </div>

          {/* Bookings List */}
          {!loading && upcoming.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {upcoming.map(({ booking, win }) => {
                const canJoin = now >= win.opens && now < win.end;
                return (
                  <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#333', fontSize: '14px', marginBottom: '2px' }}>
                        {booking.booking_reference ? `Booking ${booking.booking_reference}` : `Astrologer Booking #${booking.id}`}
                      </p>
                      <p style={{ color: '#666', fontSize: '12px' }}>
                        {`${dateFormat.format(win.start)}, ${timeFormat.format(win.start)}`}
                        {` • ₹${booking.amount} • ${booking.duration_minutes || 30} Mins`}
                      </p>
                      {!canJoin && (
                        <p style={{ color: '#9a7b4f', fontSize: '12px', marginTop: '4px' }}>
                          Join opens at {timeFormat.format(win.opens)}
                          {win.opens - now < 60 * 60 * 1000 && ` · in ${formatCountdown(win.opens - now)}`}
                        </p>
                      )}
                    </div>
                    {/* Only offered inside the join window, matching the backend rule. */}
                    {canJoin && (
                      <Link href={`/call/${booking.id}`}>
                        <button style={{ background: '#8ba145', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          <Video size={14} /> Join Call
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && (
            <div style={{ marginTop: '10px' }}>
              <Link href="/consultation" style={{ color: '#c19b63', fontWeight: 600, fontSize: '14px' }}>Book a New Call →</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
