import { useState, useEffect } from 'react'
import { useTheme } from './ThemeContext'

const API_BASE = import.meta.env.VITE_API_URL || 'https://notionnik-backend.onrender.com'

/* ── Helpers ─────────────────────────────────────────────────────── */
function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila',
  })
}

/* ── Platform icons ──────────────────────────────────────────────── */
function MeetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="1" fill="#00AC47"/>
      <path d="M22 7.5l-5 3.5V7a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h13a1 1 0 001-1v-4l5 3.5V7.5z" fill="#00832D"/>
      <path d="M22 7.5v9L17 13V11l5-3.5z" fill="#00832D"/>
    </svg>
  )
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#2D8CFF">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5H8a1.5 1.5 0 01-1.5-1.5V10a1.5 1.5 0 011.5-1.5h6a1.5 1.5 0 011.5 1.5v1.5l2.5-1.5v4l-2.5-1.5V14a1.5 1.5 0 01-1.5 1.5z"/>
    </svg>
  )
}

/* ── Confirmation Modal ───────────────────────────────────────────── */
function ConfirmationModal({ event, onClose, isDark }) {
  const isZoom = event.platform === 'zoom'

  const bg      = isDark ? 'rgba(7,14,37,0.98)'      : '#ffffff'
  const border  = isDark ? 'rgba(45,142,245,0.22)'   : 'rgba(84,131,179,0.18)'
  const heading = isDark ? '#f0f6ff'                 : '#021024'
  const body    = isDark ? 'rgba(186,220,255,0.72)'  : 'rgba(5,38,89,0.65)'
  const muted   = isDark ? 'rgba(125,160,202,0.55)'  : 'rgba(84,131,179,0.70)'
  const divider = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(84,131,179,0.10)'
  const rowVal  = isDark ? '#f0f6ff'                 : '#021024'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(2,16,36,0.38)' }} onClick={onClose}/>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '460px',
        background: bg, border: `1px solid ${border}`,
        borderRadius: '24px', padding: '36px 32px',
        boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.60)' : '0 24px 60px rgba(2,16,36,0.15)',
        backdropFilter: 'blur(20px)',
        animation: 'bookConfirmIn 0.28s ease both',
      }}>
        {/* Success icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '22px',
        }}>✓</div>

        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '22px', color: heading, textAlign: 'center', marginBottom: 6 }}>
          You're booked!
        </p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', color: muted, textAlign: 'center', marginBottom: 28 }}>
          A confirmation email has been sent to you.
        </p>

        {/* Details */}
        <div style={{ borderRadius: '14px', border: `1px solid ${divider}`, overflow: 'hidden', marginBottom: 24 }}>
          {[
            { label: 'Event',    val: event.summary },
            { label: 'Date',     val: formatDate(event.start.dateTime) },
            { label: 'Time',     val: `${formatTime(event.start.dateTime)} – ${formatTime(event.end.dateTime)}` },
            { label: 'Platform', val: isZoom ? 'Zoom' : 'Google Meet', icon: isZoom ? <ZoomIcon/> : <MeetIcon/> },
            ...(event.id && event.id !== 'pending' ? [{ label: 'Booking ID', val: event.id, mono: true }] : []),
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : 'none',
              background: i % 2 === 0
                ? (isDark ? 'rgba(255,255,255,0.025)' : 'rgba(5,38,89,0.025)')
                : 'transparent',
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: muted }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: row.mono ? "'JetBrains Mono', monospace" : "'Plus Jakarta Sans', sans-serif",
                fontSize: row.mono ? '10px' : '13px', fontWeight: 600,
                color: rowVal, display: 'flex', alignItems: 'center', gap: 6,
                maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all',
              }}>
                {row.icon}{row.val}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'transparent',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(5,38,89,0.15)'}`,
            color: body, cursor: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '13.5px',
          }}>
            Done
          </button>
        </div>
      </div>
      <style>{`@keyframes bookConfirmIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
    </div>
  )
}

/* ── Step indicator ──────────────────────────────────────────────── */
function StepDots({ step, isDark }) {
  const steps = ['Your details', 'Choose time']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const s = i + 1
        const done    = step > s
        const active  = step === s
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700,
              background: done  ? '#22c55e'
                        : active ? 'linear-gradient(135deg,#5483B3,#052659)'
                        : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(5,38,89,0.08)'),
              color: (done || active) ? '#fff' : (isDark ? 'rgba(186,220,255,0.40)' : 'rgba(5,38,89,0.40)'),
              flexShrink: 0,
            }}>
              {done ? '✓' : s}
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '12px', fontWeight: active ? 600 : 400,
              color: active
                ? (isDark ? '#C1E8FF' : '#021024')
                : (isDark ? 'rgba(186,220,255,0.40)' : 'rgba(5,38,89,0.38)'),
            }}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ width: 28, height: 1, background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(5,38,89,0.12)', marginRight: 4 }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function Book() {
  const { isDark } = useTheme()
  const [step,           setStep]           = useState(1)
  const [form,           setForm]           = useState({ name:'', email:'', company:'', title:'', notes:'', date: getTodayStr(), platform:'meet' })
  const [slots,          setSlots]          = useState([])
  const [selectedSlot,   setSelectedSlot]   = useState(null)
  const [loadingSlots,   setLoadingSlots]   = useState(false)
  const [slotsError,     setSlotsError]     = useState('')
  const [booking,        setBooking]        = useState(false)
  const [bookingError,   setBookingError]   = useState('')
  const [confirmedEvent, setConfirmedEvent] = useState(null)
  const [serverWaking,   setServerWaking]   = useState(false)

  // Pre-warm server
  useEffect(() => {
    setServerWaking(true)
    fetch(`${API_BASE}/`).finally(() => setServerWaking(false))
  }, [])

  // Fetch slots when entering step 2 or date changes
  useEffect(() => {
    if (step !== 2 || !form.date) return
    fetchSlots(form.date)
  }, [form.date, step])

  async function fetchSlots(date) {
    setLoadingSlots(true); setSlotsError(''); setSelectedSlot(null); setSlots([])
    try {
      const res  = await fetch(`${API_BASE}/api/availability?date=${date}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch slots')
      setSlots(data.available || [])
      if (!(data.available || []).length) setSlotsError(data.message || 'No available slots on this day.')
    } catch (err) { setSlotsError(err.message) }
    finally { setLoadingSlots(false) }
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleStep1(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.date) return
    setStep(2)
  }

  async function handleBook() {
    if (!selectedSlot) return
    setBooking(true); setBookingError('')
    // Optimistic modal
    setConfirmedEvent({
      id: 'pending',
      summary: form.title || `Discovery Call with ${form.name}`,
      start: { dateTime: selectedSlot.start },
      end:   { dateTime: selectedSlot.end },
      platform: form.platform,
    })
    setBooking(false)
    try {
      const res  = await fetch(`${API_BASE}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email,
          title: form.title || undefined,
          notes: form.notes || form.company ? `Company: ${form.company}\n\n${form.notes}` : undefined,
          platform: form.platform,
          start: selectedSlot.start, end: selectedSlot.end,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setConfirmedEvent(null); setBookingError(data.error || `Booking failed (${res.status})`); return }
      setConfirmedEvent({ ...data.event, pending: false })
    } catch (err) {
      console.warn('[book] Background update failed:', err.message)
      setConfirmedEvent(prev => prev ? { ...prev, pending: false } : prev)
    }
  }

  function handleModalClose() {
    setConfirmedEvent(null); setStep(1)
    setForm({ name:'', email:'', company:'', title:'', notes:'', date: getTodayStr(), platform:'meet' })
    setSlots([]); setSelectedSlot(null); setBookingError('')
  }

  /* ── Shared input style ─────────────────────────────────────── */
  const inputStyle = {
    width: '100%', borderRadius: '12px', padding: '11px 16px',
    fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(255,255,255,0.88)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(5,38,89,0.14)',
    color: isDark ? '#f0f6ff' : '#021024',
    outline: 'none',
    transition: 'border-color 0.18s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', marginBottom: '7px',
    color: isDark ? 'rgba(125,160,202,0.75)' : 'rgba(84,131,179,0.88)',
  }

  const bodyText  = isDark ? 'rgba(186,220,255,0.65)' : 'rgba(5,38,89,0.62)'
  const headText  = isDark ? '#f0f6ff'                : '#021024'
  const mutedText = isDark ? 'rgba(186,220,255,0.45)' : 'rgba(5,38,89,0.45)'

  /* ── Platform toggle button ──────────────────────────────────── */
  const PlatBtn = ({ id, label, Icon }) => {
    const active = form.platform === id
    return (
      <button type="button" onClick={() => set('platform', id)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          flex: 1, padding: '10px 14px', borderRadius: '11px',
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '13px',
          cursor: 'none', transition: 'all 0.18s',
          background: active
            ? 'linear-gradient(135deg,#5483B3,#052659)'
            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.80)'),
          border: active
            ? '1px solid rgba(84,131,179,0.45)'
            : (isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(5,38,89,0.14)'),
          color: active ? '#C1E8FF' : bodyText,
        }}>
        <Icon />{label}
      </button>
    )
  }

  return (
    <main className="pt-24">
      {confirmedEvent && <ConfirmationModal event={confirmedEvent} isDark={isDark} onClose={handleModalClose}/>}

      {/* Page header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Free Discovery Call</p>
          <h1 className="section-title text-white mb-4">
            Book a Free <span className="gradient-text-blue">Consultation</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Schedule a 30-minute discovery call and we'll map exactly how automation can save you time and money.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">

            {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Server waking banner */}
              {serverWaking && (
                <div style={{
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12.5px',
                  color: isDark ? 'rgba(253,211,77,0.85)' : '#92400e',
                }}>
                  <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Server is waking up, this may take a moment…
                </div>
              )}

              {/* What to expect */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-lg mb-5">What to Expect</h3>
                <div className="space-y-4">
                  {[
                    ['30-min discovery call',    'We discuss your workflow and exact pain points in detail.'],
                    ['Custom automation roadmap','We map the highest-ROI automation opportunities for your business.'],
                    ['Honest, no-pressure advice','No sales pitch — genuine, actionable insights tailored to you.'],
                    ['Free takeaways',           'You leave with clarity and next steps regardless of whether we work together.'],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ display:'flex', gap:12 }}>
                      <div style={{
                        width:20, height:20, borderRadius:'50%',
                        background:'rgba(45,142,245,0.18)', border:'1px solid rgba(45,142,245,0.30)',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#2d8ef5" strokeWidth={2} strokeLinecap="round"/></svg>
                      </div>
                      <div>
                        <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:'13.5px', color: headText, marginBottom:2 }}>{title}</p>
                        <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12px', color: mutedText, lineHeight:1.6 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reach out directly */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-base mb-5">Or Reach Out Directly</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    { label:'WhatsApp',  val:'+63 966 367 1854',   href:'https://wa.me/639663671854' },
                    { label:'Instagram', val:'@notionnik',          href:'https://instagram.com/notionnik' },
                    { label:'LinkedIn',  val:'NotionNik Company',   href:'https://linkedin.com/company/103721418' },
                    { label:'Upwork',    val:'View Agency Profile', href:'https://www.upwork.com/agencies/1768339692736311296/' },
                  ].map((c, i, arr) => (
                    <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'11px 0', textDecoration:'none',
                        borderBottom: i < arr.length-1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(5,38,89,0.08)'}` : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9.5px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color: isDark ? 'rgba(125,160,202,0.55)' : 'rgba(84,131,179,0.70)' }}>{c.label}</span>
                      <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px', fontWeight:500, color: isDark ? 'rgba(186,220,255,0.65)' : 'rgba(5,38,89,0.65)' }}>{c.val} →</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Session info */}
              <div style={{
                padding:'14px 18px', borderRadius:'14px',
                background: isDark ? 'rgba(45,142,245,0.07)' : 'rgba(84,131,179,0.08)',
                border: isDark ? '1px solid rgba(45,142,245,0.18)' : '1px solid rgba(84,131,179,0.18)',
                fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12.5px',
                color: isDark ? 'rgba(186,220,255,0.60)' : 'rgba(5,38,89,0.58)',
                lineHeight:1.7,
              }}>
                📅 <strong style={{ color: headText }}>30-minute sessions</strong><br/>
                Mon–Fri · 10AM – 2AM (Asia/Manila)
              </div>
            </div>

            {/* ── RIGHT: BOOKING FORM ───────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">

                <StepDots step={step} isDark={isDark}/>

                {/* ── STEP 1 ─────────────────────────────────────── */}
                {step === 1 && (
                  <form onSubmit={handleStep1} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                    <h2 style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:'20px', color: headText, marginBottom:4 }}>
                      Your details
                    </h2>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <div>
                        <label style={labelStyle}>Name *</label>
                        <input required value={form.name} onChange={e=>set('name',e.target.value)}
                          placeholder="Juan dela Cruz" style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#5483B3'}
                          onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                      </div>
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input required type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                          placeholder="you@company.com" style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#5483B3'}
                          onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Meeting title</label>
                      <input value={form.title} onChange={e=>set('title',e.target.value)}
                        placeholder="e.g. Notion setup, Automation discovery…" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#5483B3'}
                        onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                    </div>

                    <div>
                      <label style={labelStyle}>Preferred date *</label>
                      <input required type="date" value={form.date} min={getTodayStr()}
                        onChange={e=>set('date',e.target.value)} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#5483B3'}
                        onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                    </div>

                    <div>
                      <label style={labelStyle}>Meeting platform</label>
                      <div style={{ display:'flex', gap:10 }}>
                        <PlatBtn id="meet" label="Google Meet" Icon={MeetIcon}/>
                        <PlatBtn id="zoom" label="Zoom"        Icon={ZoomIcon}/>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Notes / Project context</label>
                      <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={4}
                        placeholder="What workflows are you looking to automate? What tools do you currently use?"
                        style={{ ...inputStyle, resize:'vertical', minHeight:100, lineHeight:1.65 }}
                        onFocus={e => e.target.style.borderColor = '#5483B3'}
                        onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:'14.5px', padding:'13px' }}>
                      <span>See Available Times</span>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>

                    <p style={{ textAlign:'center', fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', color: mutedText, letterSpacing:'0.06em' }}>
                      We respond within 24 hours · Your info is never shared
                    </p>
                  </form>
                )}

                {/* ── STEP 2: SLOT PICKER ──────────────────────────── */}
                {step === 2 && (
                  <div>
                    <h2 style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:'20px', color: headText, marginBottom:4 }}>
                      Choose a time
                    </h2>
                    <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px', color: bodyText, marginBottom:20 }}>
                      {formatDate(form.date)}
                    </p>

                    {/* Platform indicator */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'9.5px', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color: isDark ? 'rgba(125,160,202,0.55)' : 'rgba(84,131,179,0.70)' }}>Platform</span>
                      <span style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'4px 12px', borderRadius:'999px',
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(5,38,89,0.07)',
                        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(5,38,89,0.12)',
                        fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12px', fontWeight:600,
                        color: headText,
                      }}>
                        {form.platform === 'zoom' ? <ZoomIcon/> : <MeetIcon/>}
                        {form.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                      </span>
                    </div>

                    {/* Date changer */}
                    <div style={{ marginBottom:20 }}>
                      <label style={labelStyle}>Change date</label>
                      <input type="date" value={form.date} min={getTodayStr()}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#5483B3'}
                        onBlur={e  => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(5,38,89,0.14)'}/>
                    </div>

                    {/* Slot grid */}
                    {loadingSlots ? (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 0', gap:10, color: mutedText, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px' }}>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Loading available slots…
                      </div>
                    ) : slotsError ? (
                      <div style={{ textAlign:'center', padding:'48px 0' }}>
                        <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px', color: isDark ? 'rgba(248,113,113,0.80)' : '#b91c1c', marginBottom:6 }}>{slotsError}</p>
                        <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'12px', color: mutedText }}>Try picking a different date.</p>
                      </div>
                    ) : (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:20 }}>
                        {slots.map(slot => {
                          const active = selectedSlot?.start === slot.start
                          return (
                            <button key={slot.start} onClick={() => setSelectedSlot(slot)}
                              style={{
                                padding:'10px 8px', borderRadius:'11px', cursor:'none',
                                fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:'13px',
                                transition:'all 0.18s',
                                background: active
                                  ? 'linear-gradient(135deg,#5483B3,#052659)'
                                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.80)'),
                                border: active
                                  ? '1px solid rgba(84,131,179,0.45)'
                                  : (isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(5,38,89,0.14)'),
                                color: active ? '#C1E8FF' : bodyText,
                              }}>
                              {formatTime(slot.start)}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Selected slot summary */}
                    {selectedSlot && (
                      <div style={{
                        display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'11px 16px', borderRadius:'12px', marginBottom:18,
                        background: isDark ? 'rgba(84,131,179,0.10)' : 'rgba(84,131,179,0.08)',
                        border: isDark ? '1px solid rgba(84,131,179,0.25)' : '1px solid rgba(84,131,179,0.20)',
                      }}>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: isDark ? 'rgba(125,160,202,0.70)' : 'rgba(84,131,179,0.80)' }}>Selected</span>
                        <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13.5px', fontWeight:700, color: headText }}>
                          {formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)}
                        </span>
                      </div>
                    )}

                    {bookingError && (
                      <p style={{ textAlign:'center', fontSize:'13px', color: isDark ? 'rgba(248,113,113,0.80)' : '#b91c1c', marginBottom:14, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                        {bookingError}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex:1, justifyContent:'center' }}>
                        ← Back
                      </button>
                      <button onClick={handleBook} disabled={!selectedSlot || booking} className="btn-primary"
                        style={{ flex:2, justifyContent:'center', opacity: (!selectedSlot || booking) ? 0.45 : 1 }}>
                        <span>{booking ? 'Booking…' : 'Confirm Booking'}</span>
                        {!booking && (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}