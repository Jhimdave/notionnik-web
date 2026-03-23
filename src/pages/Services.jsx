import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SERVICES_DATA } from '../data'

const API_BASE = import.meta.env.VITE_API_URL || ''
const API_KEY = '347a8e8a-e6fa-4870-9590-bffef8481545'

function parseService(page) {
  const props = page.properties || {}
  const title = props.Title?.title?.[0]?.plain_text || props.title?.title?.[0]?.plain_text || 'Untitled'
  const desc  = props['Service Description']?.rich_text?.map(r => r.plain_text).join('') || ''
  const icon  = page.icon?.emoji || '◈'
  const logoFile = props.Logo?.files?.[0] || props.logo?.files?.[0]
  const logo  = logoFile?.type === 'external' ? logoFile.external.url : logoFile?.file?.url || null
  return { title, desc, icon, logo, id: page.id }
}

function ServiceModal({ service, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  // Match with static data if available
  const staticData = SERVICES_DATA.find(s => s.title.toLowerCase().includes(service.title.toLowerCase().split(' ')[0]))

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-navy-900 border border-brand-500/25 rounded-3xl shadow-brand-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-7 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            {service.logo
              ? <img src={service.logo} alt={service.title} className="w-12 h-12 rounded-xl object-contain" />
              : <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-2xl font-mono text-brand-400">{service.icon}</div>
            }
            <div>
              <h2 className="font-display font-bold text-white text-xl">{service.title}</h2>
              {staticData && <p className="text-brand-400/70 text-xs font-mono mt-0.5">{staticData.tagline}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-navy-700 border border-white/10 flex items-center justify-center text-blue-200/50 hover:text-white text-sm transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="overflow-y-auto p-7 space-y-6">
          {/* Description */}
          <p className="text-blue-100/75 leading-relaxed">
            {staticData?.long || service.desc || 'Professional service tailored to your workflow.'}
          </p>

          {/* Features */}
          {staticData?.features && (
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-widest text-brand-400/70 uppercase mb-3">What's included</p>
              <div className="grid grid-cols-2 gap-2">
                {staticData.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 bg-navy-800/50 rounded-xl px-3.5 py-2.5">
                    <div className="w-4 h-4 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                      <svg width="7" height="7" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#2d8ef5" strokeWidth={2} strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-blue-100/70 text-xs">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {staticData?.tools && (
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-widest text-brand-400/70 uppercase mb-3">Tools Used</p>
              <div className="flex flex-wrap gap-2">
                {staticData.tools.map(t => (
                  <span key={t} className="font-mono text-[11px] text-blue-300/70 bg-navy-800/70 border border-white/[0.08] px-3 py-1.5 rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Link to="/book" onClick={onClose}>
              <button className="btn-primary w-full justify-center text-sm py-3.5">
                <span>Get Started with This Service →</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ s, i, onClick }) {
  return (
    <button onClick={() => onClick(s)} className="card-glass p-7 text-left w-full group">
      <div className="flex items-start justify-between mb-5">
        {s.logo
          ? <img src={s.logo} alt={s.title} className="w-11 h-11 rounded-xl object-contain" />
          : <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-xl font-mono text-brand-400 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
        }
        <span className="font-mono text-[11px] font-semibold text-blue-400/40">{String(i+1).padStart(2,'0')}</span>
      </div>
      <h3 className="font-display font-bold text-white text-[1.03rem] mb-2 group-hover:text-brand-300 transition-colors">{s.title}</h3>
      <p className="text-blue-200/55 text-sm leading-relaxed mb-4">{s.desc || 'Custom automation solution tailored to your workflow.'}</p>
      <div className="flex items-center gap-1.5 text-brand-400 text-xs font-semibold">
        <span>Learn more</span>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </button>
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

export default function Services() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(0)
  const PER = 6

useEffect(() => {
  fetch(`${API_BASE}/api/notion-services`, {
    headers: {
      "x-api-key": API_KEY,
    },
  })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
    .then(d => setServices((d.results||[]).map(parseService)))
    .catch(() => setServices(SERVICES_DATA.map(s => ({ ...s, id: s.id }))))
    .finally(() => setLoading(false))
}, [])

  const total   = Math.ceil(services.length / PER)
  const current = services.slice(page*PER, page*PER+PER)

  return (
    <main className="pt-24">
      {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} />}

      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">What We Offer</p>
          <h1 className="section-title text-white mb-4">Our <span className="gradient-text-blue">Services</span></h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">Click any service to learn more about what's included.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({length:6}).map((_,i) => <Skeleton key={i}/>)
              : current.map((s,i) => <ServiceCard key={s.id||i} s={s} i={page*PER+i} onClick={setSelected} />)
            }
          </div>

          {/* Pagination dots */}
          {!loading && total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={page===0} onClick={() => setPage(p=>p-1)}
                className="w-9 h-9 rounded-xl border border-white/10 bg-navy-800 disabled:opacity-30 flex items-center justify-center text-blue-300 hover:border-brand-500/40 transition-all">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              {Array.from({length:total}).map((_,i) => (
                <button key={i} onClick={() => setPage(i)} className="transition-all duration-200 rounded-full"
                  style={{ width: i===page ? 28 : 8, height: 8, background: i===page ? '#2d8ef5' : 'rgba(45,142,245,0.2)' }}/>
              ))}
              <button disabled={page===total-1} onClick={() => setPage(p=>p+1)}
                className="w-9 h-9 rounded-xl border border-white/10 bg-navy-800 disabled:opacity-30 flex items-center justify-center text-blue-300 hover:border-brand-500/40 transition-all">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
