import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://notionnik-backend.onrender.com";

// ── Helpers ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// ── Icons ─────────────────────────────────────────────────────────
function GoogleMeetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22 7.5l-5 3.5V7a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h13a1 1 0 001-1v-4l5 3.5V7.5z" fill="#00832D"/>
      <rect x="2" y="6" width="14" height="12" rx="1" fill="#00AC47"/>
      <path d="M22 7.5v9L17 13V11l5-3.5z" fill="#00832D"/>
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#2D8CFF">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5H8a1.5 1.5 0 01-1.5-1.5V10a1.5 1.5 0 011.5-1.5h6a1.5 1.5 0 011.5 1.5v1.5l2.5-1.5v4l-2.5-1.5V14a1.5 1.5 0 01-1.5 1.5z"/>
    </svg>
  );
}

// ── Confirmation Modal ────────────────────────────────────────────
function ConfirmationModal({ event, onClose }) {
  const isZoom = event.platform === "zoom";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        style={{ animation: "fadeScaleIn 0.25s ease both" }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-6 mx-auto">
          <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          You're booked!
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          A confirmation email has been sent to you.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Event</span>
            <span className="text-gray-800 font-medium">{event.summary}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date</span>
            <span className="text-gray-800 font-medium">{formatDate(event.start.dateTime)}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time</span>
            <span className="text-gray-800 font-medium">
              {formatTime(event.start.dateTime)} – {formatTime(event.end.dateTime)}
            </span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Platform</span>
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              {isZoom ? <ZoomIcon /> : <GoogleMeetIcon />}
              {isZoom ? "Zoom" : "Google Meet"}
            </span>
          </div>

          {/* Booking ID — only show when available */}
          {event.id && event.id !== "pending" && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="text-gray-400 font-mono text-xs truncate max-w-[180px]">{event.id}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors text-center"
          >
            📧 Check your Gmail for the meeting link
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Main Booking Component ────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    notes: "",
    date: getTodayStr(),
    platform: "meet",
  });

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedEvent, setConfirmedEvent] = useState(null);
  const [serverWaking, setServerWaking] = useState(false);

  // Pre-warm Render server on mount
  useEffect(() => {
    setServerWaking(true);
    fetch(`${API_BASE}/`)
      .finally(() => setServerWaking(false));
  }, []);

  useEffect(() => {
    if (step !== 2 || !form.date) return;
    fetchSlots(form.date);
  }, [form.date, step]);

  async function fetchSlots(date) {
    setLoadingSlots(true);
    setSlotsError("");
    setSelectedSlot(null);
    setSlots([]);
    try {
      const res = await fetch(`${API_BASE}/api/availability?date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch slots");
      setSlots(data.available || []);
      if ((data.available || []).length === 0) {
        setSlotsError(data.message || "No available slots on this day.");
      }
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleStep1Submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.date) return;
    setStep(2);
  }

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);
    setBookingError("");

    // ── Show modal IMMEDIATELY with optimistic data ──────────────
    const optimisticEvent = {
      id: "pending",
      summary: form.title || `Meeting with ${form.name}`,
      start: { dateTime: selectedSlot.start },
      end: { dateTime: selectedSlot.end },
      meetLink: null,
      platform: form.platform,
      pending: true,
    };
    setConfirmedEvent(optimisticEvent);
    setBooking(false);

    // ── Then fetch in background and update modal with real data ──
    try {
      const res = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          title: form.title || undefined,
          notes: form.notes || undefined,
          platform: form.platform,
          start: selectedSlot.start,
          end: selectedSlot.end,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Booking actually failed — close modal and show error
        setConfirmedEvent(null);
        setBookingError(data.error || `Booking failed (${res.status})`);
        return;
      }

      // Update modal with real event data including Meet link
      setConfirmedEvent({
        ...data.event,
        pending: false,
      });
    } catch (err) {
      // Network error — keep modal open since event may have been created
      console.warn("[book] Background update failed:", err.message);
      setConfirmedEvent((prev) => prev ? { ...prev, pending: false } : prev);
    }
  }

  function handleModalClose() {
    setConfirmedEvent(null);
    setStep(1);
    setForm({ name: "", email: "", title: "", notes: "", date: getTodayStr(), platform: "meet" });
    setSlots([]);
    setSelectedSlot(null);
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4 py-16"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="w-full max-w-lg">

          {/* Server waking banner */}
          {serverWaking && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2">
              <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Server is waking up, this may take a moment…
            </div>
          )}

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Schedule a meeting</p>
            <h1
              className="text-4xl text-gray-900 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {step === 1 ? "Book a session." : "Pick a time slot."}
            </h1>
            {step === 2 && (
              <p className="text-sm text-gray-400 mt-2">{formatDate(form.date)}</p>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    step === s
                      ? "bg-gray-900 text-white"
                      : step > s
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                <span className={`text-xs ${step === s ? "text-gray-700" : "text-gray-300"}`}>
                  {s === 1 ? "Your details" : "Choose time"}
                </span>
                {s < 2 && <div className="w-8 h-px bg-gray-200 ml-1" />}
              </div>
            ))}
          </div>

          {/* ── Step 1: Form ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Full name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Juan dela Cruz"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="juan@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Meeting title */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Meeting title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Strategy call, Discovery session…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Preferred date *</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  min={getTodayStr()}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Platform toggle */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Meeting platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, platform: "meet" }))}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.platform === "meet"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <GoogleMeetIcon />
                    Google Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, platform: "zoom" }))}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.platform === "zoom"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <ZoomIcon />
                    Zoom
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Anything you'd like to share beforehand…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors mt-2"
              >
                See available times →
              </button>
            </form>
          )}

          {/* ── Step 2: Slot picker ── */}
          {step === 2 && (
            <div>
              {/* Platform badge */}
              <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
                <span className="text-gray-400 text-xs uppercase tracking-wider">Platform</span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                  {form.platform === "zoom" ? <ZoomIcon /> : <GoogleMeetIcon />}
                  {form.platform === "zoom" ? "Zoom" : "Google Meet"}
                </span>
              </div>

              {/* Date changer */}
              <div className="mb-6">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Change date</label>
                <input
                  type="date"
                  value={form.date}
                  min={getTodayStr()}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Slots grid */}
              {loadingSlots ? (
                <div className="flex items-center justify-center py-16 text-gray-300 text-sm gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading slots…
                </div>
              ) : slotsError ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-sm">{slotsError}</p>
                  <p className="text-gray-300 text-xs mt-1">Try picking a different date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {formatTime(slot.start)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected slot summary */}
              {selectedSlot && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex justify-between items-center text-sm">
                  <span className="text-gray-400">Selected</span>
                  <span className="text-gray-800 font-medium">
                    {formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)}
                  </span>
                </div>
              )}

              {bookingError && (
                <p className="text-red-400 text-sm mb-3 text-center">{bookingError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleBook}
                  disabled={!selectedSlot || booking}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {booking ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-xs text-gray-300 mt-8">
            30-minute sessions · Mon–Fri · 10AM–2AM (Asia/Manila)
          </p>
        </div>
      </div>

      {confirmedEvent && (
        <ConfirmationModal event={confirmedEvent} onClose={handleModalClose} />
      )}
    </>
  );
}