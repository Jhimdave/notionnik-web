import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || ''
const SEEDS    = ['Alex','Jordan','Morgan','Taylor','Sam','Casey','Riley','Drew']
const COLORS   = ['b6e3f4','c0aede','d1f4d1','ffd5dc','ffdfbf','c1e1c5','d4c5f9','f4d1b6']

function getAvatar(name, i) {
  const seed  = encodeURIComponent(name || SEEDS[i % SEEDS.length])
  const color = COLORS[i % COLORS.length]
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${color}`
}

function parseMember(page, i) {
  const p    = page.properties || {}
  const name = p.Name?.title?.[0]?.plain_text || p.name?.title?.[0]?.plain_text || 'Team Member'
  const role = p.Role?.rich_text?.[0]?.plain_text || p.role?.select?.name || 'Specialist'
  const desc = p.Description?.rich_text?.map(r => r.plain_text).join('') || ''
  const imgFile = p.Image?.files?.[0] || p.image?.files?.[0]
  const img  = imgFile?.type === 'external' ? imgFile.external.url : imgFile?.file?.url || getAvatar(name, i)
  return { name, role, desc, img }
}

const VALUES = [
  { icon: '⚡', title: 'Speed',       desc: 'We build fast and deploy even faster. Your systems go live without the long wait.' },
  { icon: '🎯', title: 'Precision',   desc: 'Every automation is tested, documented, and built to work exactly as designed.' },
  { icon: '🔒', title: 'Reliability', desc: 'We design for uptime. Your workflows run 24/7 without breaking or needing babysitting.' },
  { icon: '🤝', title: 'Partnership', desc: 'We stay with you as your systems grow — not just for the build, but for the long run.' },
]

export default function AboutUs() {
  const [team,    setTeam]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/notion-team`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => {
        const members = (d.results||[]).map(parseMember)
        members.sort((a,b) => /leader|founder|ceo/i.test(a.role) ? -1 : 1)
        setTeam(members)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Who We Are</p>
          <h1 className="section-title text-white mb-4">
            About <span className="gradient-text-blue">NotionNik</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            A team of automation specialists, Notion builders, and systems thinkers dedicated to helping businesses eliminate repetitive work and operate at a higher level.
          </p>
        </div>
      </section>

      {/* Mission / Approach */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { n:'01', title:'Our Mission', body:'To eliminate manual, repetitive work from every business we touch. Your time is too valuable to spend on tasks a well-built system can handle automatically. We engineer those systems so you can focus on growth — not grinding.' },
              { n:'02', title:'Our Approach', body:'We start by deeply understanding your workflow, then design a custom automation strategy using the right tools for your needs — Notion, n8n, Make, Google Apps, or AI. Every solution is built to scale as your business grows.' },
            ].map(s => (
              <div key={s.n} className="card-glass p-9">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-4xl font-bold text-brand-500/25">{s.n}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-brand-500/30 to-transparent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">{s.title}</h2>
                <p className="text-blue-200/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Our Values</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="p-6 rounded-2xl bg-navy-800/50 border border-white/[0.06] hover:border-brand-500/25 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-500/12 border border-brand-500/20 flex items-center justify-center text-xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-white mb-2">{v.title}</h3>
                <p className="text-blue-200/55 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">The Team</p>
          <h2 className="section-title text-white mb-2 text-3xl">
            The people behind <span className="gradient-text-blue">the systems</span>
          </h2>
          <p className="text-blue-200/55 text-base mb-12">Meet the specialists who build your automation stack.</p>

          {error && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              Could not load team from Notion. ({error})
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading && !error && Array.from({length:4}).map((_,i) => (
              <div key={i} className="card-glass p-7">
                <div className="skeleton w-16 h-16 rounded-full mx-auto mb-5" />
                <div className="skeleton h-4 w-3/5 rounded mx-auto mb-2" />
                <div className="skeleton h-3 w-2/5 rounded mx-auto" />
              </div>
            ))}
            {!loading && team.map((m, i) => (
              <div key={m.name+i} className="card-glass p-7 text-center">
                <div className="w-18 h-18 mx-auto rounded-full overflow-hidden border-2 border-brand-500/30 mb-4" style={{ width:72, height:72 }}>
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display font-bold text-white mb-1">{m.name}</h3>
                <span className="tag text-[9px] mb-3 inline-block">{m.role}</span>
                {m.desc && <p className="text-blue-200/50 text-xs leading-relaxed mt-2">{m.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="card-glass p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-white mb-2">Ready to work together?</h3>
              <p className="text-blue-200/55">Book a free call and let's talk about what we can build.</p>
            </div>
            <Link to="/book">
              <button className="btn-primary px-8 py-4 text-base flex-shrink-0"><span>Book Free Call →</span></button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
