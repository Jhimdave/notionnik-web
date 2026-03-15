import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { CASE_STUDIES } from '../data'

export default function CaseStudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cs = CASE_STUDIES.find(c => c.id === id)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (!cs) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <p className="text-blue-200/50 mb-4">Case study not found.</p>
        <Link to="/case-studies"><button className="btn-ghost">← Back to Case Studies</button></Link>
      </div>
    </div>
  )

  const other = CASE_STUDIES.filter(c => c.id !== id).slice(0, 3)

  return (
    <main className="pt-24 pb-20">
      {/* Back */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-300/60 hover:text-white transition-colors text-sm font-body">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Case Studies
        </button>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="tag">{cs.tag}</span>
          <span className="font-mono text-[10px] text-blue-400/40">{cs.client} · {cs.duration}</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          {cs.title}
        </h1>
        <p className="text-blue-200/65 text-lg leading-relaxed mb-8 max-w-2xl">{cs.subtitle}</p>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cs.metrics.map(m => (
            <div key={m.label} className="bg-navy-800/70 border border-white/[0.07] rounded-2xl p-5 text-center">
              <div className="font-display text-2xl font-extrabold text-white mb-1" style={{
                background: 'linear-gradient(135deg, #fff, #5aabff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{m.value}</div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-blue-400/55">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 mb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
      </div>

      {/* Narrative sections */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 space-y-12">

        {/* Challenge */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-base flex-shrink-0">⚠️</div>
            <h2 className="font-display text-2xl font-bold text-white">The Challenge</h2>
          </div>
          <div className="bg-navy-800/40 border border-white/[0.06] rounded-2xl p-7">
            <p className="text-blue-100/75 leading-[1.85] text-[15px]">{cs.challenge}</p>
          </div>
        </section>

        {/* Solution */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-base flex-shrink-0">⚡</div>
            <h2 className="font-display text-2xl font-bold text-white">Our Solution</h2>
          </div>
          <div className="bg-navy-800/40 border border-white/[0.06] rounded-2xl p-7 mb-6">
            <p className="text-blue-100/75 leading-[1.85] text-[15px]">{cs.solution}</p>
          </div>
          {/* Process steps */}
          <div className="space-y-3">
            <p className="font-mono text-[11px] font-semibold tracking-widest text-blue-400/60 uppercase mb-4">Step-by-Step Process</p>
            {cs.process.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-navy-800/30 border border-white/[0.05] rounded-xl px-5 py-4">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-mono text-[10px] font-bold text-brand-400 flex-shrink-0 mt-0.5">{i+1}</span>
                <p className="text-blue-200/70 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools used */}
        <section>
          <p className="font-mono text-[11px] font-semibold tracking-widest text-blue-400/60 uppercase mb-4">Tools & Stack</p>
          <div className="flex flex-wrap gap-2">
            {cs.tools.map(t => (
              <span key={t} className="px-4 py-2 rounded-xl bg-navy-800/70 border border-white/[0.08] font-mono text-sm text-blue-300/70">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Outcome */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/15 border border-emerald-400/25 flex items-center justify-center text-base flex-shrink-0">✅</div>
            <h2 className="font-display text-2xl font-bold text-white">The Outcome</h2>
          </div>
          <div className="bg-emerald-400/[0.06] border border-emerald-400/15 rounded-2xl p-7">
            <p className="text-blue-100/80 leading-[1.85] text-[15px]">{cs.outcome}</p>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-brand-500/20 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[400px] h-[200px] rounded-full bg-brand-500/10 blur-[60px]" />
          </div>
          <div className="relative z-10">
            <p className="font-mono text-[11px] font-semibold tracking-widest text-brand-400 uppercase mb-3">Want results like this?</p>
            <h3 className="font-display text-2xl font-extrabold text-white mb-3">Let's build your automation</h3>
            <p className="text-blue-200/55 text-sm mb-6 max-w-sm mx-auto">Book a free discovery call and we'll map out exactly how we can help your business.</p>
            <Link to="/book">
              <button className="btn-primary text-base px-8 py-3.5">
                <span>Book Free Call →</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Other case studies */}
      {other.length > 0 && (
        <div className="max-w-4xl mx-auto px-5 md:px-8 mt-20">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
          <p className="font-mono text-[11px] font-semibold tracking-widest text-blue-400/60 uppercase mb-6">More Case Studies</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {other.map(o => (
              <Link key={o.id} to={`/case-studies/${o.id}`}
                className="card-glass p-5 group block"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/12 border border-brand-500/20 flex items-center justify-center text-xl mb-3">{o.icon}</div>
                <span className="tag text-[9px] mb-2 inline-block">{o.tag}</span>
                <h4 className="font-display font-bold text-white text-sm leading-snug group-hover:text-brand-300 transition-colors">{o.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
