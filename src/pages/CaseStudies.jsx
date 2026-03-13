import { useState } from 'react'
import { Link } from 'react-router-dom'

const CASES = [
  {
    icon: '🛍️', tag: 'E-Commerce', title: 'Shopify Product Uploader',
    desc: 'Automated bulk product uploads to Shopify with zero manual entry — client saved 12 hours per week and eliminated data errors entirely.',
    result: '12 hrs/week saved', tools: ['Make', 'Notion', 'Shopify API'], color: '#2d8ef5',
  },
  {
    icon: '🗒️', tag: 'Notion Integration', title: 'Meeting Summary → Notion',
    desc: 'AI-generated meeting summaries pushed automatically into a structured Notion database with tagged action items and owner assignments.',
    result: '100% capture rate', tools: ['n8n', 'OpenAI', 'Notion'], color: '#5aabff',
  },
  {
    icon: '🎬', tag: 'AI Automation', title: 'Video Generation Pipeline',
    desc: 'Fully automated AI video creation from a single content brief — 5x content output with consistent brand voice across all platforms.',
    result: '5× content output', tools: ['Make', 'OpenAI', 'Heygen'], color: '#2d8ef5',
  },
  {
    icon: '📄', tag: 'Google Workspace', title: 'Sheet → Document Automation',
    desc: 'Auto-populate proposal and report templates from Google Sheets — proposals ready in 30 seconds instead of 2 hours.',
    result: 'Zero manual formatting', tools: ['Apps Script', 'Google Docs', 'Notion'], color: '#5aabff',
  },
  {
    icon: '🧾', tag: 'Business Automation', title: 'Invoice Generation System',
    desc: 'Auto-generate and send professional invoices triggered by booking forms, calendar events, or spreadsheet entries.',
    result: 'Instant invoicing', tools: ['Make', 'Stripe', 'Google Sheets'], color: '#2d8ef5',
  },
  {
    icon: '📊', tag: 'Reporting', title: 'Weekly KPI Dashboard',
    desc: 'Automated weekly business KPI reports compiled from 5 data sources and delivered to Notion and Slack every Monday at 8am.',
    result: 'Full visibility, zero effort', tools: ['n8n', 'Notion', 'Slack'], color: '#5aabff',
  },
]

const ALL_TAGS = ['All', ...Array.from(new Set(CASES.map(c => c.tag)))]

export default function CaseStudies() {
  const [filter, setFilter] = useState('All')
  const shown = filter === 'All' ? CASES : CASES.filter(c => c.tag === filter)

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Real Results</p>
          <h1 className="section-title text-white mb-4">
            Case <span className="gradient-text-blue">Studies</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Real automation systems we've built for real clients, with measurable outcomes.
          </p>
        </div>
      </section>

      {/* Filter */}
      <div className="sticky top-[68px] z-40 border-b border-white/[0.05] bg-navy-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {ALL_TAGS.map(t => (
              <button
                key={t} onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 font-body
                  ${filter===t ? 'bg-brand-500/15 border border-brand-500/30 text-brand-300' : 'text-blue-200/50 border border-transparent hover:text-white'}`}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((c, i) => (
              <div key={c.title} className="card-glass p-7 flex flex-col gap-5" style={{ transitionDelay: `${i*0.07}s` }}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/12 border border-brand-500/22 flex items-center justify-center text-2xl">
                    {c.icon}
                  </div>
                  <span className="tag">{c.tag}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-[1.05rem] mb-2">{c.title}</h3>
                  <p className="text-blue-200/55 text-sm leading-relaxed">{c.desc}</p>
                </div>
                {/* Result */}
                <div className="flex items-center gap-2 bg-emerald-400/[0.07] border border-emerald-400/15 rounded-xl px-4 py-2.5">
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-emerald-400/70">RESULT</span>
                  <span className="text-emerald-400 font-bold text-sm">{c.result}</span>
                </div>
                {/* Tools */}
                <div className="flex flex-wrap gap-1.5">
                  {c.tools.map(t => (
                    <span key={t} className="font-mono text-[10px] text-blue-300/50 bg-navy-700/60 border border-white/[0.06] px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="glow-divider mb-14" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-white mb-2">Want results like these?</h2>
              <p className="text-blue-200/55">Let's build your automation system together.</p>
            </div>
            <Link to="/book">
              <button className="btn-primary px-8 py-4 text-base">
                <span>Book a Free Call →</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
