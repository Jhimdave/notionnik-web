import { useState } from 'react'

const SERVICES = ['Notion Workspace Setup','Workflow Automation','AI Integration','Google Workspace','API Connections','Full Automation Stack','Not Sure Yet']
const BUDGETS  = ['Under $500','$500 – $1,000','$1,000 – $3,000','$3,000+']

export default function Book() {
  const [form,    setForm]    = useState({ name:'', email:'', company:'', service:'', budget:'', message:'' })
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

  const inputCls = `w-full bg-navy-800/70 border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder-blue-200/25 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 font-body`

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Get Started</p>
          <h1 className="section-title text-white mb-4">
            Book a Free <span className="gradient-text-blue">Consultation</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Tell us about your project and we'll schedule a 30-minute discovery call to map out exactly how automation can save you time and money.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">

            {/* Left sidebar */}
            <div className="lg:col-span-2 space-y-5">
              {/* What to expect */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-lg mb-5">What to Expect</h3>
                <div className="space-y-4">
                  {[
                    ['30-min call',     'We\'ll discuss your workflow and exact pain points.'],
                    ['Custom roadmap',  'We\'ll identify the highest-ROI automation opportunities.'],
                    ['Honest advice',   'No sales pressure — just genuine, actionable insights.'],
                    ['Free takeaways',  'You\'ll leave with clarity regardless of next steps.'],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="9" height="9" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#2d8ef5" strokeWidth={2} strokeLinecap="round"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{title}</p>
                        <p className="text-blue-200/50 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct contact */}
              <div className="card-glass p-7">
                <h3 className="font-display font-bold text-white text-base mb-5">Or Reach Out Directly</h3>
                <div className="space-y-3">
                  {[
                    { label: 'WhatsApp',   val: '+63 966 367 1854',                href: 'https://wa.me/639663671854' },
                    { label: 'Instagram',  val: '@notionnik',                       href: 'https://instagram.com/notionnik' },
                    { label: 'LinkedIn',   val: 'NotionNik Company',                href: 'https://linkedin.com/company/103721418' },
                    { label: 'Upwork',     val: 'View Agency Profile',              href: 'https://www.upwork.com/agencies/1768339692736311296/' },
                  ].map(c => (
                    <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-none hover:text-brand-400 transition-colors group">
                      <span className="font-mono text-[10px] text-blue-400/50 tracking-widest uppercase">{c.label}</span>
                      <span className="text-blue-200/60 text-sm group-hover:text-brand-400 transition-colors">{c.val} →</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                {sent ? (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
                    <h3 className="font-display text-2xl font-extrabold text-white mb-3">We'll be in touch!</h3>
                    <p className="text-blue-200/60 text-sm leading-relaxed max-w-xs mx-auto">
                      Thanks for reaching out. We'll review your message and get back within 24 hours to schedule your discovery call.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <h2 className="font-display text-xl font-bold text-white mb-6">Tell us about your project</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Name *</label>
                        <input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="John Smith" className={inputCls} />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Email *</label>
                        <input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="john@company.com" className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Company / Business</label>
                      <input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Your company name" className={inputCls} />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Service Interested In</label>
                      <select value={form.service} onChange={e=>set('service',e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' stroke='%234a6090' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                      >
                        <option value="" className="bg-navy-900">Select a service...</option>
                        {SERVICES.map(s => <option key={s} value={s} className="bg-navy-900">{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Budget Range</label>
                      <div className="flex flex-wrap gap-2">
                        {BUDGETS.map(b => (
                          <button key={b} type="button" onClick={() => set('budget', b)}
                            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-body
                              ${form.budget===b ? 'bg-brand-500/15 border border-brand-500/35 text-brand-300' : 'bg-navy-800 border border-white/[0.08] text-blue-200/55 hover:border-brand-500/25 hover:text-white'}`}
                          >{b}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">Tell us about your project *</label>
                      <textarea required value={form.message} onChange={e=>set('message',e.target.value)} rows={5}
                        placeholder="What workflows are you looking to automate? What tools do you currently use? What's your biggest operational pain point?"
                        className={`${inputCls} resize-y min-h-[120px]`}
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3.5" style={{ opacity: loading ? 0.75 : 1 }}>
                      <span>{loading ? 'Sending…' : 'Send Message'}</span>
                      {!loading && (
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
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
