import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://notionnik-backend.onrender.com";
const API_KEY = import.meta.env.VITE_API_SECRET;

/* ── Helpers ─────────────────────────────────────────────────────── */
function getTodayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateStr(year, month, day) {
  // month here is 0-indexed (JS Date month)
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  // Parse as local date to avoid UTC shift
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-PH", {
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

function getMonthData(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  // month is 1-indexed from the string; convert to 0-indexed for JS Date
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  return { year, month: month - 1, daysInMonth, startDayOfWeek };
}

/* ── Platform icons ──────────────────────────────────────────────── */
function MeetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="1" fill="#00AC47" />
      <path
        d="M22 7.5l-5 3.5V7a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h13a1 1 0 001-1v-4l5 3.5V7.5z"
        fill="#00832D"
      />
      <path d="M22 7.5v9L17 13V11l5-3.5z" fill="#00832D" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#2D8CFF">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5H8a1.5 1.5 0 01-1.5-1.5V10a1.5 1.5 0 011.5-1.5h6a1.5 1.5 0 011.5 1.5v1.5l2.5-1.5v4l-2.5-1.5V14a1.5 1.5 0 01-1.5 1.5z" />
    </svg>
  );
}

/* ── Calendar Component ─────────────────────────────────────────── */
function Calendar({ selectedDate, onSelect, isDark }) {
  const { year, month, daysInMonth, startDayOfWeek } =
    getMonthData(selectedDate);

  // Today's local date — computed once, never mutated
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();

  // Parse selected date into local components for comparison
  const [selYear, selMonth, selDay] = selectedDate.split("-").map(Number);

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // FIX: Build date string manually — no toISOString() so no UTC offset shift
  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onSelect(toDateStr(d.getFullYear(), d.getMonth(), 1));
  };

  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onSelect(toDateStr(d.getFullYear(), d.getMonth(), 1));
  };

  const selectDay = (day) => {
    // month is already 0-indexed from getMonthData
    onSelect(toDateStr(year, month, day));
  };

  const headerColor = isDark ? "#f0f6ff" : "#021024";
  const dayColor = isDark ? "rgba(186,220,255,0.65)" : "rgba(5,38,89,0.62)";
  const mutedColor = isDark
    ? "rgba(125,160,202,0.40)"
    : "rgba(84,131,179,0.40)";
  const bgColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.80)";
  const borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(5,38,89,0.14)";

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "transparent",
            border: "none",
            color: dayColor,
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px 8px",
          }}
        >
          ←
        </button>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: headerColor,
          }}
        >
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "transparent",
            border: "none",
            color: dayColor,
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px 8px",
          }}
        >
          →
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          textAlign: "center",
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 600,
              color: mutedColor,
              padding: "8px 0",
            }}
          >
            {d}
          </div>
        ))}

        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          // FIX: Compare using local date components — no Date objects that can UTC-shift
          const isToday =
            year === todayYear && month === todayMonth && day === todayDay;

          const isSelected =
            year === selYear && month === selMonth - 1 && day === selDay;

          // A day is "past" only if it's strictly before today in local time
          const isPast =
            year < todayYear ||
            (year === todayYear && month < todayMonth) ||
            (year === todayYear && month === todayMonth && day < todayDay);

          return (
            <button
              key={`day-${day}`}
              onClick={() => !isPast && selectDay(day)}
              disabled={isPast}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "none",
                background: isSelected
                  ? "linear-gradient(135deg,#5483B3,#052659)"
                  : isToday
                    ? "rgba(45,142,245,0.15)"
                    : "transparent",
                color: isSelected
                  ? "#C1E8FF"
                  : isPast
                    ? mutedColor
                    : dayColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "14px",
                fontWeight: isSelected || isToday ? 600 : 400,
                cursor: isPast ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Confirmation Modal ───────────────────────────────────────────── */
function ConfirmationModal({ event, onClose, isDark }) {
  const isZoom = event.platform === "zoom";

  const bg = isDark ? "rgba(7,14,37,0.98)" : "#ffffff";
  const border = isDark ? "rgba(45,142,245,0.22)" : "rgba(84,131,179,0.18)";
  const heading = isDark ? "#f0f6ff" : "#021024";
  const body = isDark ? "rgba(186,220,255,0.72)" : "rgba(5,38,89,0.65)";
  const muted = isDark ? "rgba(125,160,202,0.55)" : "rgba(84,131,179,0.70)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(84,131,179,0.10)";
  const rowVal = isDark ? "#f0f6ff" : "#021024";

  // Extract date string from the start ISO — use Manila timezone
  const startDate = new Date(event.start.dateTime).toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  }); // yields "YYYY-MM-DD"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: isDark ? "rgba(0,0,0,0.72)" : "rgba(2,16,36,0.38)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.60)"
            : "0 24px 60px rgba(2,16,36,0.15)",
          backdropFilter: "blur(20px)",
          animation: "bookConfirmIn 0.28s ease both",
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.12)",
            border: "1.5px solid rgba(34,197,94,0.30)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "22px",
          }}
        >
          ✓
        </div>

        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "22px",
            color: heading,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          You're booked!
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px",
            color: muted,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          A confirmation email has been sent to you.
        </p>

        {/* Details */}
        <div
          style={{
            borderRadius: "14px",
            border: `1px solid ${divider}`,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {[
            { label: "Event", val: event.summary },
            { label: "Date", val: formatDate(startDate) },
            {
              label: "Time",
              val: `${formatTime(event.start.dateTime)} – ${formatTime(event.end.dateTime)}`,
            },
            {
              label: "Platform",
              val: isZoom ? "Zoom" : "Google Meet",
              icon: isZoom ? <ZoomIcon /> : <MeetIcon />,
            },
            ...(event.id && event.id !== "pending"
              ? [{ label: "Booking ID", val: event.id, mono: true }]
              : []),
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 16px",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${divider}` : "none",
                background:
                  i % 2 === 0
                    ? isDark
                      ? "rgba(255,255,255,0.025)"
                      : "rgba(5,38,89,0.025)"
                    : "transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: muted,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: row.mono
                    ? "'JetBrains Mono', monospace"
                    : "'Plus Jakarta Sans', sans-serif",
                  fontSize: row.mono ? "10px" : "13px",
                  fontWeight: 600,
                  color: rowVal,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  maxWidth: "60%",
                  textAlign: "right",
                  wordBreak: "break-all",
                }}
              >
                {row.icon}
                {row.val}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#052659,#021024)",
              color: "#C1E8FF",
              textDecoration: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "13.5px",
            }}
          >
            📧 Check Gmail for the meeting link
          </a>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              background: "transparent",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(5,38,89,0.15)"}`,
              color: body,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "13.5px",
            }}
          >
            Done
          </button>
        </div>
      </div>
      <style>{`@keyframes bookConfirmIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────────────── */
function StepDots({ step, isDark }) {
  const steps = ["Choose time", "Your details"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 28,
      }}
    >
      {steps.map((label, i) => {
        const s = i + 1;
        const done = step > s;
        const active = step === s;
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                background: done
                  ? "#22c55e"
                  : active
                    ? "linear-gradient(135deg,#5483B3,#052659)"
                    : isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(5,38,89,0.08)",
                color:
                  done || active
                    ? "#fff"
                    : isDark
                      ? "rgba(186,220,255,0.40)"
                      : "rgba(5,38,89,0.40)",
                flexShrink: 0,
              }}
            >
              {done ? "✓" : s}
            </div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "12px",
                fontWeight: active ? 600 : 400,
                color: active
                  ? isDark
                    ? "#C1E8FF"
                    : "#021024"
                  : isDark
                    ? "rgba(186,220,255,0.40)"
                    : "rgba(5,38,89,0.38)",
              }}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 28,
                  height: 1,
                  background: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(5,38,89,0.12)",
                  marginRight: 4,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function Book() {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
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

  // Pre-warm server
  useEffect(() => {
    setServerWaking(true);
    fetch(`${API_BASE}/`).finally(() => setServerWaking(false));
  }, []);

  // Fetch slots when date changes
  useEffect(() => {
    if (!form.date) return;
    fetchSlots(form.date);
  }, [form.date]);

  async function fetchSlots(date) {
    setLoadingSlots(true);
    setSlotsError("");
    setSelectedSlot(null);
    setSlots([]);
    try {
      const res = await fetch(`${API_BASE}/api/availability?date=${date}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch slots");
      setSlots(data.available || []);
      if (!(data.available || []).length)
        setSlotsError(data.message || "No available slots on this day.");
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  }

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleDateSelect(date) {
    set("date", date);
  }

  function handleTimeSelect(slot) {
    setSelectedSlot(slot);
  }

  function handleContinueToDetails() {
    if (!selectedSlot) return;
    setStep(2);
  }

  function handleBackToCalendar() {
    setStep(1);
  }

  async function handleBook() {
    if (!selectedSlot || !form.name || !form.email) return;

    const meetingTitle = `Appointment Scheduled: ${form.name} x NotionNik`;

    setBooking(true);
    setBookingError("");

    // Optimistic modal
    setConfirmedEvent({
      id: "pending",
      summary: meetingTitle,
      start: { dateTime: selectedSlot.start },
      end: { dateTime: selectedSlot.end },
      platform: form.platform,
    });
    setBooking(false);

    try {
      const res = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          title: meetingTitle,
          notes:
            form.notes || form.company
              ? `Company: ${form.company}\n\n${form.notes}`
              : undefined,
          platform: form.platform,
          start: selectedSlot.start,
          end: selectedSlot.end,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmedEvent(null);
        setBookingError(data.error || `Booking failed (${res.status})`);
        return;
      }
      setConfirmedEvent({ ...data.event, pending: false });
    } catch (err) {
      console.warn("[book] Background update failed:", err.message);
      setConfirmedEvent((prev) => (prev ? { ...prev, pending: false } : prev));
    }
  }

  function handleModalClose() {
    setConfirmedEvent(null);
    setStep(1);
    setForm({
      name: "",
      email: "",
      company: "",
      notes: "",
      date: getTodayStr(),
      platform: "meet",
    });
    setSlots([]);
    setSelectedSlot(null);
    setBookingError("");
  }

  /* ── Shared input style ─────────────────────────────────────── */
  const inputStyle = {
    width: "100%",
    borderRadius: "12px",
    padding: "11px 16px",
    fontSize: "14px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.88)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.09)"
      : "1px solid rgba(5,38,89,0.14)",
    color: isDark ? "#f0f6ff" : "#021024",
    outline: "none",
    transition: "border-color 0.18s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "7px",
    color: isDark ? "rgba(125,160,202,0.75)" : "rgba(84,131,179,0.88)",
  };

  const bodyText = isDark ? "rgba(186,220,255,0.65)" : "rgba(5,38,89,0.62)";
  const headText = isDark ? "#f0f6ff" : "#021024";
  const mutedText = isDark ? "rgba(186,220,255,0.45)" : "rgba(5,38,89,0.45)";

  /* ── Platform toggle button ──────────────────────────────────── */
  const PlatBtn = ({ id, label, Icon }) => {
    const active = form.platform === id;
    return (
      <button
        type="button"
        onClick={() => set("platform", id)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flex: 1,
          padding: "10px 14px",
          borderRadius: "11px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.18s",
          background: active
            ? "linear-gradient(135deg,#5483B3,#052659)"
            : isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.80)",
          border: active
            ? "1px solid rgba(84,131,179,0.45)"
            : isDark
              ? "1px solid rgba(255,255,255,0.09)"
              : "1px solid rgba(5,38,89,0.14)",
          color: active ? "#C1E8FF" : bodyText,
        }}
      >
        <Icon />
        {label}
      </button>
    );
  };

  return (
    <main className="pt-24">
      {confirmedEvent && (
        <ConfirmationModal
          event={confirmedEvent}
          isDark={isDark}
          onClose={handleModalClose}
        />
      )}

      {/* Page header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Free Discovery Call</p>
          <h1 className="section-title text-white mb-4">
            Book a Free <span className="gradient-text-blue">Consultation</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Schedule a 30-minute discovery call and we'll map exactly how
            automation can save you time and money.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* ── LEFT: BOOKING FORM ───────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                <StepDots step={step} isDark={isDark} />

                {/* ── STEP 1: AVAILABILITY ──────────────────────────── */}
                {step === 1 && (
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "20px",
                        color: headText,
                        marginBottom: 4,
                      }}
                    >
                      Select Date & Time
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "13px",
                        color: bodyText,
                        marginBottom: 24,
                      }}
                    >
                      Choose your preferred meeting slot
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 24,
                      }}
                    >
                      {/* Left: Calendar */}
                      <div>
                        <Calendar
                          selectedDate={form.date}
                          onSelect={handleDateSelect}
                          isDark={isDark}
                        />

                        {/* Selected date display */}
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            background: isDark
                              ? "rgba(84,131,179,0.10)"
                              : "rgba(84,131,179,0.08)",
                            border: isDark
                              ? "1px solid rgba(84,131,179,0.25)"
                              : "1px solid rgba(84,131,179,0.20)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: isDark
                                ? "rgba(125,160,202,0.70)"
                                : "rgba(84,131,179,0.80)",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Selected Date
                          </span>
                          <span
                            style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: headText,
                            }}
                          >
                            {formatDate(form.date)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Time Slots */}
                      <div>
                        <div style={{ marginBottom: "16px" }}>
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: isDark
                                ? "rgba(125,160,202,0.70)"
                                : "rgba(84,131,179,0.80)",
                            }}
                          >
                            Available Times
                          </span>
                        </div>

                        {/* Platform indicator */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 16,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "9.5px",
                              fontWeight: 700,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: isDark
                                ? "rgba(125,160,202,0.55)"
                                : "rgba(84,131,179,0.70)",
                            }}
                          >
                            Platform
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 12px",
                              borderRadius: "999px",
                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(5,38,89,0.07)",
                              border: isDark
                                ? "1px solid rgba(255,255,255,0.10)"
                                : "1px solid rgba(5,38,89,0.12)",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: headText,
                            }}
                          >
                            {form.platform === "zoom" ? (
                              <ZoomIcon />
                            ) : (
                              <MeetIcon />
                            )}
                            {form.platform === "zoom" ? "Zoom" : "Google Meet"}
                          </span>
                        </div>

                        {/* Platform toggle */}
                        <div
                          style={{ display: "flex", gap: 10, marginBottom: 16 }}
                        >
                          <PlatBtn
                            id="meet"
                            label="Google Meet"
                            Icon={MeetIcon}
                          />
                          <PlatBtn id="zoom" label="Zoom" Icon={ZoomIcon} />
                        </div>

                        {/* Slots grid */}
                        {loadingSlots ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "32px 0",
                              gap: 10,
                              color: mutedText,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: "13px",
                            }}
                          >
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Loading available slots…
                          </div>
                        ) : slotsError ? (
                          <div
                            style={{ textAlign: "center", padding: "32px 0" }}
                          >
                            <p
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "13px",
                                color: isDark
                                  ? "rgba(248,113,113,0.80)"
                                  : "#b91c1c",
                                marginBottom: 6,
                              }}
                            >
                              {slotsError}
                            </p>
                            <p
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "12px",
                                color: mutedText,
                              }}
                            >
                              Try picking a different date.
                            </p>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr",
                              gap: 8,
                              maxHeight: "320px",
                              overflowY: "auto",
                              paddingRight: "4px",
                            }}
                          >
                            {slots.map((slot) => {
                              const active = selectedSlot?.start === slot.start;
                              return (
                                <button
                                  key={slot.start}
                                  onClick={() => handleTimeSelect(slot)}
                                  style={{
                                    padding: "12px 16px",
                                    borderRadius: "11px",
                                    cursor: "pointer",
                                    fontFamily:
                                      "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    transition: "all 0.18s",
                                    textAlign: "left",
                                    background: active
                                      ? "linear-gradient(135deg,#5483B3,#052659)"
                                      : isDark
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(255,255,255,0.80)",
                                    border: active
                                      ? "1px solid rgba(84,131,179,0.45)"
                                      : isDark
                                        ? "1px solid rgba(255,255,255,0.09)"
                                        : "1px solid rgba(5,38,89,0.14)",
                                    color: active ? "#C1E8FF" : bodyText,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span>
                                      {formatTime(slot.start)} –{" "}
                                      {formatTime(slot.end)}
                                    </span>
                                    {active && (
                                      <span style={{ fontSize: "12px" }}>
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Selected slot summary */}
                        {selectedSlot && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "11px 16px",
                              borderRadius: "12px",
                              marginTop: 16,
                              background: isDark
                                ? "rgba(84,131,179,0.10)"
                                : "rgba(84,131,179,0.08)",
                              border: isDark
                                ? "1px solid rgba(84,131,179,0.25)"
                                : "1px solid rgba(84,131,179,0.20)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: isDark
                                  ? "rgba(125,160,202,0.70)"
                                  : "rgba(84,131,179,0.80)",
                              }}
                            >
                              Selected
                            </span>
                            <span
                              style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: headText,
                              }}
                            >
                              {formatTime(selectedSlot.start)} –{" "}
                              {formatTime(selectedSlot.end)}
                            </span>
                          </div>
                        )}

                        {/* Continue button */}
                        <button
                          onClick={handleContinueToDetails}
                          disabled={!selectedSlot}
                          className="btn-primary"
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            fontSize: "14.5px",
                            padding: "13px",
                            marginTop: "20px",
                            opacity: !selectedSlot ? 0.45 : 1,
                          }}
                        >
                          <span>Continue</span>
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14M12 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: YOUR DETAILS ───────────────────────── */}
                {step === 2 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleBook();
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "20px",
                        color: headText,
                        marginBottom: 4,
                      }}
                    >
                      Your details
                    </h2>

                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "13px",
                        color: bodyText,
                        marginBottom: 8,
                      }}
                    >
                      {formatDate(form.date)} at{" "}
                      {selectedSlot && formatTime(selectedSlot.start)} –{" "}
                      {selectedSlot && formatTime(selectedSlot.end)}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Name *</label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Juan dela Cruz"
                          style={inputStyle}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#5483B3")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = isDark
                              ? "rgba(255,255,255,0.09)"
                              : "rgba(5,38,89,0.14)")
                          }
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="you@company.com"
                          style={inputStyle}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#5483B3")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = isDark
                              ? "rgba(255,255,255,0.09)"
                              : "rgba(5,38,89,0.14)")
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Company / Business</label>
                      <input
                        value={form.company}
                        onChange={(e) => set("company", e.target.value)}
                        placeholder="Your company name"
                        style={inputStyle}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#5483B3")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark
                            ? "rgba(255,255,255,0.09)"
                            : "rgba(5,38,89,0.14)")
                        }
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Notes / Project context</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        rows={4}
                        placeholder="Please share anything that will help prepare for our meeting."
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: 100,
                          lineHeight: 1.65,
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#5483B3")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = isDark
                            ? "rgba(255,255,255,0.09)"
                            : "rgba(5,38,89,0.14)")
                        }
                      />
                    </div>

                    {bookingError && (
                      <p
                        style={{
                          textAlign: "center",
                          fontSize: "13px",
                          color: isDark ? "rgba(248,113,113,0.80)" : "#b91c1c",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {bookingError}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={handleBackToCalendar}
                        className="btn-ghost"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={booking}
                        className="btn-primary"
                        style={{
                          flex: 2,
                          justifyContent: "center",
                          opacity: booking ? 0.45 : 1,
                        }}
                      >
                        <span>{booking ? "Booking…" : "Confirm Booking"}</span>
                        {!booking && (
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14M12 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <p
                      style={{
                        textAlign: "center",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        color: mutedText,
                        letterSpacing: "0.06em",
                        marginTop: 8,
                      }}
                    >
                      We respond within 24 hours · Your info is never shared
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Server waking banner */}
              {serverWaking && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(245,158,11,0.22)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "12.5px",
                    color: isDark ? "rgba(253,211,77,0.85)" : "#92400e",
                  }}
                >
                  <svg
                    className="w-3 h-3 animate-spin flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Server is waking up, this may take a moment…
                </div>
              )}

              {/* What to expect */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-lg mb-5">
                  What to Expect
                </h3>
                <div className="space-y-4">
                  {[
                    [
                      "30-min discovery call",
                      "We discuss your workflow and exact pain points in detail.",
                    ],
                    [
                      "Custom automation roadmap",
                      "We map the highest-ROI automation opportunities for your business.",
                    ],
                    [
                      "Honest, no-pressure advice",
                      "No sales pitch — genuine, actionable insights tailored to you.",
                    ],
                    [
                      "Free takeaways",
                      "You leave with clarity and next steps regardless of whether we work together.",
                    ],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ display: "flex", gap: 12 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "rgba(45,142,245,0.18)",
                          border: "1px solid rgba(45,142,245,0.30)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 12 10"
                          fill="none"
                        >
                          <path
                            d="M1 5l3.5 3.5L11 1"
                            stroke="#2d8ef5"
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: "13.5px",
                            color: headText,
                            marginBottom: 2,
                          }}
                        >
                          {title}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "12px",
                            color: mutedText,
                            lineHeight: 1.6,
                          }}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reach out directly */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-base mb-5">
                  Or Reach Out Directly
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {[
                    {
                      label: "WhatsApp",
                      val: "+63 932 541 7031",
                      href: "https://wa.me/639325417031",
                    },
                    {
                      label: "Instagram",
                      val: "@notionnik",
                      href: "https://instagram.com/notionnik",
                    },
                    {
                      label: "LinkedIn",
                      val: "NotionNik Company",
                      href: "https://linkedin.com/company/103721418",
                    },
                    {
                      label: "Upwork",
                      val: "View Agency Profile",
                      href: "https://www.upwork.com/agencies/1768339692736311296/",
                    },
                  ].map((c, i, arr) => (
                    <a
                      key={c.label}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "11px 0",
                        textDecoration: "none",
                        borderBottom:
                          i < arr.length - 1
                            ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(5,38,89,0.08)"}`
                            : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.75")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "9.5px",
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: isDark
                            ? "rgba(125,160,202,0.55)"
                            : "rgba(84,131,179,0.70)",
                        }}
                      >
                        {c.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: isDark
                            ? "rgba(186,220,255,0.65)"
                            : "rgba(5,38,89,0.65)",
                        }}
                      >
                        {c.val} →
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Session info */}
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "14px",
                  background: isDark
                    ? "rgba(45,142,245,0.07)"
                    : "rgba(84,131,179,0.08)",
                  border: isDark
                    ? "1px solid rgba(45,142,245,0.18)"
                    : "1px solid rgba(84,131,179,0.18)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "12.5px",
                  color: isDark
                    ? "rgba(186,220,255,0.60)"
                    : "rgba(5,38,89,0.58)",
                  lineHeight: 1.7,
                }}
              >
                📅{" "}
                <strong style={{ color: headText }}>30-minute sessions</strong>
                <br />
                Mon–Fri · 10AM – 2AM (Asia/Manila)
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}