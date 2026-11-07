"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  astrologerName: string;
  astrologerId?: number;
}

/**
 * Today's date in the user's own timezone.
 *
 * toISOString() is UTC, so for IST users between 00:00 and 05:30 it returns
 * yesterday - which defaulted the picker to a past date and let `min` accept it.
 */
function localToday(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The signed-in user's id, or null. Guards against the literal "undefined"
 *  string that localStorage ends up holding when login stores a missing id. */
function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user_id");
  if (!raw || raw === "undefined" || raw === "null") return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function BookingModal({ isOpen, onClose, astrologerName, astrologerId = 1 }: BookingModalProps) {
  const [languageId, setLanguageId] = useState<number>(1);
  const today = localToday();
  const [date, setDate] = useState<string>(today);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("evening");
  const [timeSlotId, setTimeSlotId] = useState<number | string>("4:00 PM");

  // No email field: the booking model has no contact fields, and since login is
  // required the astrologer already gets the account's name and email via
  // user_details. The phone is validated but not sent yet - see handleBooking.
  const [formData, setFormData] = useState(() => ({
    // Prefilled from the signed-in account. The modal is only mounted in the
    // browser after Book Now is clicked, so localStorage is available here.
    name: typeof window !== "undefined" ? localStorage.getItem("user_name") || "" : "",
    phone: "",
    topicId: "1",
    notes: ""
  }));
  const [formError, setFormError] = useState<string | null>(null);

  const [languages, setLanguages] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [timeSlotsData, setTimeSlotsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    const userId = getUserId();
    const userBookingsPromise = userId 
      ? fetch(`/api/backend/bookings?user=${userId}&date=${date}`).then(res => res.ok ? res.json() : { results: [] }).catch(() => ({ results: [] }))
      : Promise.resolve({ results: [] });

    try {
      const [langs, tops, slotsResp, userBookingsResp] = await Promise.all([
        fetch("/api/backend/languages").then(res => res.ok ? res.json() : []).catch(() => []),
        fetch("/api/backend/consultation-topics").then(res => res.ok ? res.json() : []).catch(() => []),
        fetch(`/api/backend/time-slots?astrologer=${astrologerId}&date=${date}`).then(res => res.ok ? res.json() : { results: [] }).catch(() => ({ results: [] })),
        userBookingsPromise
      ]);

      setLanguages(Array.isArray(langs) ? langs : []);
      setTopics(Array.isArray(tops) ? tops : []);
      
      // Get IDs of time slots the user has already booked
      const userBookings = userBookingsResp?.results || (Array.isArray(userBookingsResp) ? userBookingsResp : []);
      const userBookedSlotIds = new Set(userBookings.map((b: any) => b.time_slot));

      // Only keep available (not booked) slots, and filter out those the user already booked
      const allSlots = slotsResp?.results || (Array.isArray(slotsResp) ? slotsResp : []);
      const availableSlots = allSlots.filter((s: any) => !s.is_booked && !userBookedSlotIds.has(s.id));
      setTimeSlotsData(availableSlots);
      
      // Auto-select first available slot if current is invalid
      setTimeSlotId(prev => {
        if (availableSlots.find((s: any) => s.id === prev)) return prev;
        if (availableSlots.length > 0) {
          setTimeOfDay(availableSlots[0].period || 'morning');
          return availableSlots[0].id;
        }
        return "";
      });
    } catch (err) {
      console.error("Failed to load options", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    } else {
      // Reset success state so re-opening the modal starts fresh
      setBookingSuccess(false);
      setFormError(null);
    }
    // astrologerId matters: the slots URL is per astrologer.
  }, [isOpen, date, astrologerId]);

  if (!isOpen) return null;

  const defaultLanguages = [
    { id: 1, name: "Hindi" },
    { id: 2, name: "English" },
    { id: 3, name: "Tamil" },
    { id: 4, name: "Telugu" }
  ];
  const displayLanguages = languages.length > 0 ? languages : defaultLanguages;

  const defaultTopics = [
    { id: 1, name: "Career & Business" },
    { id: 2, name: "Marriage & Relationships" },
    { id: 3, name: "Health & Wellness" },
    { id: 4, name: "Wealth & Property" },
    { id: 5, name: "Education" },
    { id: 6, name: "Other" }
  ];
  const displayTopics = topics.length > 0 ? topics : defaultTopics;

  // Group available slots by period
  const displayTimeSlots: Record<string, any[]> = {
    morning: timeSlotsData.filter((s: any) => s.period === 'morning'),
    afternoon: timeSlotsData.filter((s: any) => s.period === 'afternoon'),
    evening: timeSlotsData.filter((s: any) => s.period === 'evening')
  };
  const hasNoSlots = timeSlotsData.length === 0;

  const slotLabel = (slot: any) => slot?.time?.slice(0, 5) || slot?.start_time?.slice(0, 5) || "";
  const selectedSlotLabel = slotLabel(timeSlotsData.find((s: any) => s.id === timeSlotId));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async () => {
    setFormError(null);

    // Never attribute a booking to a fallback account - that used to file it
    // against user 2, a real person's account.
    const userId = getUserId();
    if (userId === null) {
      setFormError("Please sign in before booking so your consultation is linked to your account.");
      return;
    }

    const name = formData.name.trim();
    if (name.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }

    const phone = formData.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setFormError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Every consultation is a scheduled call, so a time slot is required.
    const slotId = Number(timeSlotId);
    const hasValidSlot = Number.isInteger(slotId) && slotId > 0;
    if (!hasValidSlot) {
      setFormError("Please select a time slot for your scheduled call.");
      return;
    }

    setBookingLoading(true);
    try {
      // The phone number is deliberately NOT sent yet. The API's booking list is
      // readable by anyone without logging in, so putting it in `notes` made it
      // public. It goes into a private contact field once the API adds one.
      const noteParts = [`Booking by ${name}`];
      if (formData.notes.trim()) noteParts.push(formData.notes.trim());

      // Step 1: Create booking in backend
      const bookingPayload: Record<string, unknown> = {
        user: userId,
        astrologer: astrologerId,
        language: languageId,
        topic: Number(formData.topicId),
        consultation_type: "book_call",
        time_slot: slotId,
        duration_minutes: 30,
        amount: 500.00,
        notes: noteParts.join(" | ")
      };

      const bookingRes = await fetch("/api/backend/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        let errorMsg = "Failed to book consultation";
        if (bookingData.detail) errorMsg = bookingData.detail;
        else if (bookingData.message) errorMsg = bookingData.message;
        else if (bookingData.time_slot) {
          errorMsg = Array.isArray(bookingData.time_slot) ? bookingData.time_slot[0] : bookingData.time_slot;
          if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already booked')) {
            errorMsg = "This time slot has just been booked by someone else. Please choose a different slot.";
            fetchOptions(); // Refresh the slots list to remove the booked slot
          }
        }
        else if (bookingData.non_field_errors) {
          // Django REST unique_together violations come here
          const nfe = bookingData.non_field_errors;
          errorMsg = Array.isArray(nfe) ? nfe[0] : nfe;
          // Make constraint error human-readable
          if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('unique')) {
            errorMsg = "You already have a booking that conflicts. Please choose a different time slot or date.";
          } else if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already booked')) {
            errorMsg = "This time slot has just been booked by someone else. Please choose a different slot.";
            fetchOptions();
          }
        }
        else if (typeof bookingData === 'object') {
          const firstKey = Object.keys(bookingData)[0];
          const firstValue = firstKey ? bookingData[firstKey] : null;
          if (Array.isArray(firstValue)) errorMsg = `${firstKey}: ${firstValue[0]}`;
          else if (typeof firstValue === 'string') errorMsg = `${firstKey}: ${firstValue}`;
          else errorMsg = JSON.stringify(bookingData);
        }
        // Show error in the form (not just an alert) so user can retry
        setFormError(errorMsg);
        setBookingLoading(false);
        return;
      }

      // Load Razorpay
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

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setFormError("Failed to load Razorpay. Please check your internet connection.");
        setBookingLoading(false);
        return;
      }

      // Create Razorpay order server-side
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500, bookingId: `CONSULTATION_${Date.now()}` })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setFormError(orderData.error || "Failed to initiate payment");
        setBookingLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Punyam Astrology",
        description: `Consultation with ${astrologerName}`,
        order_id: orderData.orderId,
        prefill: {
          name: name,
          contact: `+91${phone}`,
        },
        theme: { color: "#c19b63" },
        handler: async (response: any) => {
          // Payment successful
          setBookingLoading(false);
          setBookingSuccess(true);
        },
        modal: {
          ondismiss: () => { setBookingLoading(false); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setFormError(`Payment failed: ${response.error.description}`);
        setBookingLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred. Please try again.");
      setBookingLoading(false);
    }
  };


  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: "950px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "#f1f1f1",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          <X size={20} color="#333" />
        </button>

        {bookingSuccess ? (
          <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '400px', flex: 1 }}>
            <CheckCircle2 size={80} color="#8ba145" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '28px', color: '#222', marginBottom: '16px' }}>Booking Successful!</h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '32px', maxWidth: '400px', lineHeight: 1.6 }}>
              Your consultation is booked{selectedSlotLabel ? ` for ${date} at ${selectedSlotLabel}` : ""}. Join it from your dashboard, starting 5 minutes before the scheduled time. Our team will contact you with the payment and confirmation details.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  onClose();
                }}
                style={{
                  padding: "14px 32px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e5e5e5"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          
          {/* LEFT SIDE: Slots and Calendar */}
          <div style={{ 
            flex: "1 1 500px", minWidth: 0, 
            padding: "clamp(20px, 5vw, 40px)", 
            borderRight: "1px solid #eee",
            backgroundColor: "#fafafa" 
          }}>
            <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "#222" }}>Book Consultation</h2>
            <p style={{ color: "#666", marginBottom: "30px", fontSize: "15px" }}>with {astrologerName}</p>

            {/* Language Selection */}
            <div style={{ marginBottom: "30px" }}>
              <p style={{ fontWeight: 600, color: "#333", marginBottom: "12px", fontSize: "15px" }}>Choose language</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingBottom: "5px" }}>
                {displayLanguages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguageId(lang.id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: languageId === lang.id ? "1px solid #8ba145" : "1px solid #ddd",
                      backgroundColor: languageId === lang.id ? "#e9f2c6" : "#fff",
                      fontWeight: languageId === lang.id ? 600 : 500,
                      color: "#333",
                      minWidth: "80px",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s"
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div style={{ marginBottom: "30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <CalendarIcon size={18} color="#555" />
                <p style={{ fontWeight: 600, color: "#333", fontSize: "15px", margin: 0 }}>Choose date</p>
              </div>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid #ddd",
                  backgroundColor: "#fff",
                  fontSize: "16px",
                  color: "#333",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#8ba145"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Clock size={18} color="#555" />
                <p style={{ fontWeight: 600, color: "#333", fontSize: "15px", margin: 0 }}>Choose time slot</p>
              </div>

              {loading ? (
                <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Loading available slots...</p>
              ) : hasNoSlots ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#fff8e1', borderRadius: '12px', border: '1px solid #ffe082' }}>
                  <p style={{ fontSize: '14px', color: '#b45309', fontWeight: 600, marginBottom: '6px' }}>No available slots</p>
                  <p style={{ fontSize: '13px', color: '#92400e' }}>There are currently no available time slots for this astrologer. Please check back later.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
                    {["morning", "afternoon", "evening"].filter(period => displayTimeSlots[period]?.length > 0).map(period => (
                      <button
                        key={period}
                        onClick={() => setTimeOfDay(period as any)}
                        style={{
                          flex: 1,
                          padding: "12px 0",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: timeOfDay === period ? "#8ba145" : "#777",
                          borderBottom: timeOfDay === period ? "2px solid #8ba145" : "2px solid transparent",
                          transition: "all 0.2s"
                        }}
                      >
                        {period.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 100px), 1fr))", gap: "12px" }}>
                    {(displayTimeSlots[timeOfDay] || []).map((slot: any) => (
                      <button
                        key={slot.id}
                        onClick={() => setTimeSlotId(slot.id)}
                        style={{
                          padding: "12px 0",
                          borderRadius: "8px",
                          border: timeSlotId === slot.id ? "1px solid #8ba145" : "1px solid #ddd",
                          backgroundColor: timeSlotId === slot.id ? "#e9f2c6" : "#fff",
                          fontWeight: timeSlotId === slot.id ? 600 : 500,
                          color: timeSlotId === slot.id ? "#222" : "#555",
                          fontSize: "14px",
                          transition: "all 0.2s"
                        }}
                      >
                        {slot.time?.slice(0, 5) || slot.start_time?.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Fill Details */}
          <div style={{ 
            flex: "1 1 350px", minWidth: 0, 
            padding: "clamp(20px, 5vw, 40px)", 
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column"
          }}>
            <h3 style={{ fontSize: "20px", marginBottom: "24px", color: "#222", fontWeight: 600 }}>Your Details</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
              
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "15px",
                    backgroundColor: "#fcfcfc"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>Phone Number</label>
                <div style={{ display: "flex" }}>
                  <span style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "0 14px", 
                    backgroundColor: "#f5f5f5", 
                    border: "1px solid #ccc", 
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                    color: "#555",
                    fontSize: "15px"
                  }}>+91</span>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      borderRadius: "0 8px 8px 0",
                      border: "1px solid #ccc",
                      fontSize: "15px",
                      backgroundColor: "#fcfcfc"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>Topic of Concern</label>
                <select 
                  name="topicId"
                  value={formData.topicId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "15px",
                    backgroundColor: "#fcfcfc",
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px top 50%",
                    backgroundSize: "12px auto"
                  }}
                >
                  {displayTopics.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name || t.title || t.topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>Notes</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional information..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "15px",
                    backgroundColor: "#fcfcfc",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Summary Card */}
              <div style={{
                marginTop: "auto",
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #eaeaea"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#666", fontSize: "14px" }}>Date & Time</span>
                  {/* Show the slot's actual time. timeSlotId is a database id,
                      so rendering it read as e.g. "2026-09-10, 47". */}
                  <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
                    {selectedSlotLabel ? `${date}, ${selectedSlotLabel}` : date}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#666", fontSize: "14px" }}>Duration</span>
                  <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>30 mins</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px dashed #ccc", marginTop: "4px" }}>
                  <span style={{ color: "#333", fontWeight: 600, fontSize: "16px" }}>Total Amount</span>
                  <span style={{ fontWeight: 700, color: "#8ba145", fontSize: "18px" }}>₹500</span>
                </div>
              </div>

              {formError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b42318", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", lineHeight: 1.5 }}>
                  {formError}
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleBooking}
                disabled={bookingLoading || loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "#222",
                  color: "#fff",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "none",
                  cursor: bookingLoading ? "not-allowed" : "pointer",
                  marginTop: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "background-color 0.2s",
                  opacity: bookingLoading ? 0.7 : 1
                }}
                onMouseOver={(e) => !bookingLoading && (e.currentTarget.style.backgroundColor = "#000")}
                onMouseOut={(e) => !bookingLoading && (e.currentTarget.style.backgroundColor = "#222")}
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
          
          </div>
        )}
      </div>
    </div>
  );
}
