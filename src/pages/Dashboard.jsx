import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

/* ── Reveal hook ───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Animated counter ──────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const step = ts => {
          const p = Math.min((ts - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(ease * target))
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])

  return <span ref={ref}>{val}{suffix}</span>
}

const STATS = [
  { value: 50,  suffix: '+', label: 'Projects Completed' },
  { value: 30,  suffix: '+', label: 'Happy Clients'      },
  { value: 100, suffix: '%', label: 'Automation Rate'    },
  { value: 3,   suffix: 'yr', label: 'Experience'        },
]

const CAPABILITIES = [
  {
    icon: '◈', title: 'Notion Workspaces',
    desc: 'Custom databases, dashboards, and knowledge systems built to your exact workflow.',
    color: '#2d8ef5',
  },
  {
    icon: '⟳', title: 'Workflow Automation',
    desc: 'End-to-end automation using n8n, Make, and Zapier — eliminating repetitive manual work.',
    color: '#5aabff',
  },
  {
    icon: '⬡', title: 'AI Integrations',
    desc: 'Embed GPT-powered logic and AI workflows directly into your business operations.',
    color: '#2d8ef5',
  },
  {
    icon: '⌘', title: 'Google Workspace',
    desc: 'Sheets, Docs, Gmail, and Drive — automated and connected to your core systems.',
    color: '#5aabff',
  },
  {
    icon: '✦', title: 'API Connections',
    desc: 'We bridge any tool to any platform with robust, production-ready API integrations.',
    color: '#2d8ef5',
  },
  {
    icon: '◉', title: 'System Design',
    desc: 'Architecture consulting to build scalable operational systems that grow with you.',
    color: '#5aabff',
  },
]

const PROCESS = [
  { step: '01', title: 'Discovery',  desc: 'We deep-dive into your current workflow, tools, and pain points.' },
  { step: '02', title: 'Strategy',   desc: 'We design a custom automation roadmap with clear ROI targets.' },
  { step: '03', title: 'Build',      desc: 'We engineer your system end-to-end, fully tested and documented.' },
  { step: '04', title: 'Handover',   desc: 'Full training, docs, and 30-day support so your team runs it with confidence.' },
]

export default function Dashboard() {
  useReveal()

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-brand-500/[0.07] blur-[100px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-navy-600/30 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div>
              <div className="pill mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
                <span className="status-live" />
                Notion Automation Agency
              </div>

              <h1
                className="font-display font-extrabold leading-[1.03] tracking-tight mb-6 animate-fade-up"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', animationDelay: '0.15s' }}
              >
                <span className="text-white">We Build Systems</span><br />
                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-600 bg-clip-text text-transparent">
                  That Work<br />While You Sleep
                </span>
              </h1>

              <p className="text-blue-200/65 text-[1.05rem] leading-relaxed mb-8 max-w-[480px] animate-fade-up" style={{ animationDelay: '0.25s' }}>
                Notion workspaces, automation workflows, and AI integrations, engineered for founders
                who want clarity without chaos. Save 10+ hours a week, starting this month.
              </p>

              <div className="flex flex-wrap gap-3 mb-10 animate-fade-up" style={{ animationDelay: '0.35s' }}>
                <Link to="/book">
                  <button className="btn-primary">
                    <span>Book Free Discovery Call</span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="animate-bounce-x">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <Link to="/case-studies">
                  <button className="btn-ghost">View Case Studies</button>
                </Link>
              </div>

              {/* Logos / trust */}
              <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.45s' }}>
                <div className="flex -space-x-2.5">
                  {['AC','JR','KL','TS'].map((init, i) => (
                    <div key={init} className="w-8 h-8 rounded-full border-2 border-navy-900 bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center text-[10px] font-bold text-white" style={{ zIndex: 4-i }}>
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-200/55">
                  <span className="text-white font-semibold">30+ founders</span> already automated
                </p>
              </div>
            </div>

            {/* Right — floating logo mark */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Outer ring */}
              <div className="absolute w-[380px] h-[380px] rounded-full border border-brand-500/15 animate-spin-slow" />
              <div className="absolute w-[290px] h-[290px] rounded-full border border-brand-500/10" />
              {/* Pulse rings */}
              <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-500/10 animate-[pulseRing_3s_ease-out_infinite]" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-500/10 animate-[pulseRing_3s_ease-out_1s_infinite]" />

              {/* Central logo */}
              <div className="relative z-10 animate-float bg-navy-1000/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-brand">
                <Logo size={130} showText={false} />
              </div>

              {/* Orbit cards */}
              {[
                { angle: 0,   label: 'Notion',      icon: '◈', delay: '0s'   },
                { angle: 90,  label: 'Automation',  icon: '⟳', delay: '0.5s' },
                { angle: 180, label: 'AI Powered',  icon: '⬡', delay: '1s'   },
                { angle: 270, label: 'Google WS',   icon: '⌘', delay: '1.5s' },
              ].map(({ angle, label, icon, delay }) => {
                const rad = (angle * Math.PI) / 180
                const r = 160
                const x = Math.round(Math.cos(rad) * r)
                const y = Math.round(Math.sin(rad) * r)
                return (
                  <div
                    key={label}
                    className="absolute flex items-center gap-2 bg-navy-800/90 backdrop-blur-sm border border-white/[0.08] rounded-xl px-3 py-2 animate-float-delayed shadow-card"
                    style={{ transform: `translate(${x}px, ${y}px)`, animationDelay: delay }}
                  >
                    <span className="text-brand-400 text-sm font-mono">{icon}</span>
                    <span className="text-white text-xs font-semibold whitespace-nowrap">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-white/[0.05] bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center reveal">
                <div className="font-display text-4xl md:text-5xl font-extrabold stat-number mb-2">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="font-mono text-[11px] tracking-widest uppercase text-blue-400/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="reveal">
              <p className="section-label">What We Do</p>
              <h2 className="section-title text-white">
                Full-Stack <span className="gradient-text-blue">Automation</span>
              </h2>
            </div>
            <Link to="/services" className="reveal">
              <button className="btn-ghost">Explore All Services →</button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.title}
                className="card-glass p-7 reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 font-mono"
                  style={{ background: `${c.color}18`, border: `1px solid ${c.color}30`, color: c.color }}
                >
                  {c.icon}
                </div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-bold text-[1.05rem] text-white">{c.title}</h3>
                  <span className="idx">{String(i+1).padStart(2,'0')}</span>
                </div>
                <p className="text-blue-200/55 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────────────────────── */}
      <section className="py-20 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 reveal">
            <p className="section-label justify-center">How It Works</p>
            <h2 className="section-title text-white">Our <span className="gradient-text-blue">Process</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative reveal" style={{ transitionDelay: `${i*0.1}s` }}>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-[calc(100%-32px)] h-px bg-gradient-to-r from-brand-500/30 to-transparent z-10" />
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center font-mono text-xs font-bold text-white mb-5 relative z-20">
                  {p.step}
                </div>
                <h3 className="font-display font-bold text-white text-[1.05rem] mb-2">{p.title}</h3>
                <p className="text-blue-200/55 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="reveal relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-navy-800 to-navy-900 p-12 md:p-16 text-center">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[300px] rounded-full bg-brand-500/10 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <p className="section-label justify-center mb-4">Ready to Start</p>
              <h2 className="section-title text-white mb-4">
                Let's automate<br />
                <span className="gradient-text-blue">your entire business.</span>
              </h2>
              <p className="text-blue-200/60 text-base leading-relaxed max-w-md mx-auto mb-8">
                Book a free 30-minute discovery call. We'll map exactly where automation saves you time and money — zero obligation.
              </p>
              <Link to="/book">
                <button className="btn-primary text-base px-8 py-4">
                  <span>Book Free Consultation</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
