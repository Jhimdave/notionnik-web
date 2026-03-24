import { useState, useEffect } from 'react'
const API_BASE = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_SECRET;

const TOPICS = ['General Inquiry', 'Notion Workspace', 'Workflow Automation', 'AI Integration', 'Google Workspace', 'Partnership', 'Other']

export default function Contact() {
  const [form,      setForm]    = useState({ name:'', email:'', topic:'', message:'' })
  const [sent,      setSent]    = useState(false)
  const [loading,   setLoading] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auto-reset back to form after 5 seconds
  useEffect(() => {
    if (!sent) return
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setSent(false)
          setForm({ name:'', email:'', topic:'', message:'' })
          return 5
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [sent])

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "x-api-key": API_KEY,
         },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const input = `w-full bg-navy-800/70 border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder-blue-200/25 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 font-body`

      const WhatsAppIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )

      const InstagramIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )

      const LinkedInIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )

      const UpworkIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
        </svg>
      )

      const FacebookIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )

      const channels = [
        { icon: <WhatsAppIcon />, label: 'WhatsApp', val: '+63 966 367 1854', href: 'https://wa.me/639663671854', note: 'Fastest response' },
        { icon: <InstagramIcon />, label: 'Instagram', val: '@notionnik', href: 'https://instagram.com/notionnik', note: 'DMs welcome' },
        { icon: <LinkedInIcon />, label: 'LinkedIn', val: 'NotionNik', href: 'https://linkedin.com/company/103721418', note: 'Professional enquiries' },
        { icon: <UpworkIcon />, label: 'Upwork', val: 'View Profile', href: 'https://www.upwork.com/agencies/1768339692736311296/', note: 'Hire via platform' },
        { icon: <FacebookIcon />, label: 'Facebook', val: 'NotionNik', href: 'https://www.facebook.com/notionnik/', note: 'Follow for updates' },
      ]

  return (
    <main className="pt-24 pb-20">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Get In Touch</p>
          <h1 className="section-title text-white mb-4">
            Contact <span className="gradient-text-blue">Us</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Have a question, project idea, or just want to say hi? We're always open for a conversation.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">

            {/* Left — channels */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-lg mb-2">Reach Us Directly</h3>
                <p className="text-blue-200/50 text-sm mb-6">Pick your preferred channel. WhatsApp is fastest.</p>
                <div className="space-y-1">
                  {channels.map(c => (
                    <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{c.label}</span>
                          <span className="font-mono text-[9px] text-brand-400/60 tracking-wider">{c.note}</span>
                        </div>
                        <span className="text-blue-200/50 text-xs">{c.val}</span>
                      </div>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                        className="text-blue-400/30 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div className="card-glass p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-lg flex-shrink-0">⏱️</div>
                <div>
                  <p className="font-display font-bold text-white text-sm">Typically replies within 24h</p>
                  <p className="text-blue-200/50 text-xs mt-0.5">WhatsApp responses are usually within 2–4 hours during business hours (PH time)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                <span className="status-live" />
                <span className="font-mono text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">Currently Accepting New Projects</span>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
                    <h3 className="font-display text-2xl font-extrabold text-white mb-3">Message received!</h3>
                    <p className="text-blue-200/60 text-sm leading-relaxed max-w-xs mx-auto">
                      We'll get back to you within 24 hours. For faster responses, reach us on WhatsApp.
                    </p>
                    <p className="mt-6 font-mono text-[11px] text-blue-200/30 tracking-wider">
                      Returning to form in <span className="text-brand-400">{countdown}</span>s…
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <h2 className="font-display text-xl font-bold text-white mb-6">Send us a message</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Name *</label>
                        <input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your name" className={input}/>
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Email *</label>
                        <input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" className={input}/>
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Topic</label>
                      <select value={form.topic} onChange={e=>set('topic',e.target.value)}
                        className={`${input} cursor-pointer`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' stroke='%234a6090' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                      >
                        <option value="" className="bg-navy-900">Select a topic...</option>
                        {TOPICS.map(t => <option key={t} value={t} className="bg-navy-900">{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Message *</label>
                      <textarea required value={form.message} onChange={e=>set('message',e.target.value)} rows={6}
                        placeholder="Tell us what's on your mind…"
                        className={`${input} resize-y min-h-[120px]`}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3.5" style={{ opacity: loading ? 0.75 : 1 }}>
                      <span>{loading ? 'Sending…' : 'Send Message'}</span>
                      {!loading && (
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      )}
                    </button>
                    <p className="text-center font-mono text-[10px] text-blue-200/30 tracking-wider">We respond within 24 hours · Your info is never shared</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}