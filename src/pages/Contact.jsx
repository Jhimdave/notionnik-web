import { useState } from 'react'

const TOPICS = ['General Inquiry', 'Notion Workspace', 'Workflow Automation', 'AI Integration', 'Google Workspace', 'Partnership', 'Other']

export default function Contact() {
  const [form,    setForm]    = useState({ name:'', email:'', topic:'', message:'' })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const input = `w-full bg-navy-800/70 border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder-blue-200/25 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 font-body`

  const channels = [
    { icon: '💬', label: 'WhatsApp', val: '+63 966 367 1854', href: 'https://wa.me/639663671854', note: 'Fastest response' },
    { icon: '📸', label: 'Instagram', val: '@notionnik', href: 'https://instagram.com/notionnik', note: 'DMs welcome' },
    { icon: '💼', label: 'LinkedIn', val: 'NotionNik', href: 'https://linkedin.com/company/103721418', note: 'Professional enquiries' },
    { icon: '🏗️', label: 'Upwork', val: 'View Profile', href: 'https://www.upwork.com/agencies/1768339692736311296/', note: 'Hire via platform' },
    { icon: '📘', label: 'Facebook', val: 'NotionNik', href: 'https://www.facebook.com/notionnik/', note: 'Follow for updates' },
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
                    <p className="text-blue-200/60 text-sm leading-relaxed max-w-xs mx-auto">We'll get back to you within 24 hours. For faster responses, reach us on WhatsApp.</p>
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
