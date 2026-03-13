import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || ''

function parseService(page) {
  const props = page.properties || {}
  const title = props.Title?.title?.[0]?.plain_text || props.title?.title?.[0]?.plain_text || 'Untitled'
  const desc  = props['Service Description']?.rich_text?.map(r => r.plain_text).join('') || ''
  const icon  = page.icon?.emoji || '◈'
  const logoFile = props.Logo?.files?.[0] || props.logo?.files?.[0]
  const logo  = logoFile?.type === 'external' ? logoFile.external.url : logoFile?.file?.url || null
  return { title, desc, icon, logo }
}

const PER_PAGE = 6

const FALLBACK_SERVICES = [
  { icon: '◈', title: 'Notion Workspace Setup',     desc: 'Custom-built Notion databases, dashboards, and wikis tailored to your team\'s exact workflow.' },
  { icon: '⟳', title: 'Workflow Automation',        desc: 'End-to-end automation using n8n, Make, and Zapier — connecting your tools to work seamlessly together.' },
  { icon: '⬡', title: 'AI Integrations',            desc: 'Embed GPT-powered logic and AI workflows directly into your Notion workspace and business processes.' },
  { icon: '⌘', title: 'Google Workspace Automation', desc: 'Automate Sheets, Docs, Gmail, Drive, and Calendar — connected to your core operational systems.' },
  { icon: '✦', title: 'API Connections',            desc: 'Bridge any tool to any platform with robust, production-grade API integrations and webhooks.' },
  { icon: '◉', title: 'System Design Consulting',   desc: 'Architecture consulting to design scalable operational systems that grow and adapt with your business.' },
]

const PRICING = [
  {
    name: 'Starter', price: '$499', period: '/project',
    desc: 'For solo founders getting started with Notion and automation.',
    features: ['1 Notion workspace setup', 'Up to 3 automated workflows', 'Google Workspace integration', '1 month support'],
    cta: 'Get Started', accent: false,
  },
  {
    name: 'Growth', price: '$1,299', period: '/project',
    desc: 'For growing businesses that need a complete automation stack.',
    features: ['Full Notion OS build', 'Unlimited workflows', 'AI integrations', 'API connections', '3 months support', 'Video walkthrough'],
    cta: 'Most Popular', accent: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    desc: 'Complex multi-tool ecosystems for established teams.',
    features: ['Everything in Growth', 'Dedicated build engineer', 'Team onboarding', 'SLA support', 'Monthly review calls'],
    cta: 'Contact Us', accent: false,
  },
]

function ServiceCard({ s, i }) {
  return (
    <div className="card-glass p-7" style={{ transitionDelay: `${i*0.07}s` }}>
      <div className="flex items-start justify-between mb-5">
        {s.logo
          ? <img src={s.logo} alt={s.title} className="w-11 h-11 rounded-xl object-contain" />
          : (
            <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-xl font-mono text-brand-400">
              {s.icon}
            </div>
          )
        }
        <span className="font-mono text-[11px] font-semibold text-blue-400/40">{String(i+1).padStart(2,'0')}</span>
      </div>
      <h3 className="font-display font-bold text-white text-[1.03rem] mb-2">{s.title}</h3>
      <p className="text-blue-200/55 text-sm leading-relaxed">{s.desc || 'Custom automation solution tailored to your workflow.'}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="card-glass p-7">
      <div className="skeleton w-11 h-11 rounded-xl mb-5" />
      <div className="skeleton h-4 w-3/5 rounded mb-3" />
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-3 w-4/5 rounded" />
    </div>
  )
}

function Pagination({ page, total, setPage }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button disabled={page===0} onClick={() => setPage(p=>p-1)}
        className="w-9 h-9 rounded-xl border border-white/10 bg-navy-800 disabled:opacity-30 flex items-center justify-center text-blue-300 hover:border-brand-500/40 transition-all">
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      {Array.from({length: total}).map((_,i) => (
        <button key={i} onClick={() => setPage(i)}
          className="transition-all duration-200 rounded-full"
          style={{ width: i===page ? 28 : 8, height: 8, background: i===page ? '#2d8ef5' : 'rgba(45,142,245,0.2)' }}
        />
      ))}
      <button disabled={page===total-1} onClick={() => setPage(p=>p+1)}
        className="w-9 h-9 rounded-xl border border-white/10 bg-navy-800 disabled:opacity-30 flex items-center justify-center text-blue-300 hover:border-brand-500/40 transition-all">
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [page,     setPage]     = useState(0)

  useEffect(() => {
    fetch(`${API_BASE}/api/notion-services`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => setServices((d.results||[]).map(parseService)))
      .catch(e => { setError(e.message); setServices(FALLBACK_SERVICES) })
      .finally(() => setLoading(false))
  }, [])

  const total   = Math.ceil(services.length / PER_PAGE)
  const current = services.slice(page*PER_PAGE, page*PER_PAGE+PER_PAGE)

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">What We Offer</p>
          <h1 className="section-title text-white mb-4">
            Our <span className="gradient-text-blue">Services</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            From Notion workspaces to full automation pipelines — we build systems that save time, reduce errors, and scale with your business.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {error && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              Could not load from Notion — showing default services. ({error})
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({length:6}).map((_,i) => <Skeleton key={i}/>)
              : current.map((s,i) => <ServiceCard key={s.title+i} s={s} i={page*PER_PAGE+i}/>)
            }
          </div>
          {!loading && <Pagination page={page} total={total} setPage={setPage}/>}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-white/[0.05] bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="section-label justify-center">Pricing</p>
            <h2 className="section-title text-white">Transparent <span className="gradient-text-blue">Project Pricing</span></h2>
            <p className="text-blue-200/55 text-base mt-3 max-w-md mx-auto">No retainers. No hidden fees. Know exactly what you're getting.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition-all duration-300
                  ${plan.accent
                    ? 'bg-gradient-to-b from-navy-700 to-navy-800 border-brand-500/40 shadow-brand scale-[1.03]'
                    : 'bg-navy-800/60 border-white/[0.07] hover:border-brand-500/25 hover:shadow-card-hover hover:-translate-y-1'
                  }`}
              >
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-mono text-[11px] font-semibold tracking-widest text-brand-400 uppercase mb-3">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-blue-300/50 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-blue-200/55 text-sm leading-relaxed">{plan.desc}</p>
                </div>
                <div className="border-t border-white/[0.06] pt-6 mb-7 space-y-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#2d8ef5" strokeWidth={2} strokeLinecap="round"/></svg>
                      </div>
                      <span className="text-blue-100/70 text-[13px]">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/book">
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                      ${plan.accent
                        ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-brand'
                        : 'bg-transparent border border-white/10 text-blue-200/70 hover:border-brand-500/30 hover:text-white hover:bg-brand-500/10'
                      }`}
                  >
                    {plan.cta} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
