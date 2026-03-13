import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const TESTIMONIALS = [
  {
    name: 'Alex Carter', role: 'Founder, CartFlow', avatar: 'AC', rating: 5,
    text: 'NotionNik completely transformed how our team operates. They built a Notion system that replaced 4 different tools and automated our entire client onboarding. We\'re saving at least 15 hours a week.',
    tag: 'Notion + Automation',
  },
  {
    name: 'Jordan Reyes', role: 'CEO, Reyes Digital', avatar: 'JR', rating: 5,
    text: 'I was drowning in manual admin work. NotionNik built us an automation pipeline that handles everything from lead capture to invoice generation. The ROI in the first month was unreal.',
    tag: 'Full Stack Automation',
  },
  {
    name: 'Kim Larsson', role: 'Operations Lead, ScaleUp Co.', avatar: 'KL', rating: 5,
    text: 'The Google Workspace automation they built for us is incredible. Reports that took our team 3 hours now generate automatically every Monday morning. Highly recommend.',
    tag: 'Google Workspace',
  },
  {
    name: 'Taylor Simms', role: 'E-commerce Founder', avatar: 'TS', rating: 5,
    text: 'They built a Shopify product upload automation that saves me 12 hours every single week. The system is rock solid — it\'s been running perfectly for 8 months without a single issue.',
    tag: 'E-Commerce',
  },
  {
    name: 'Sam O\'Brien', role: 'Marketing Director', avatar: 'SO', rating: 5,
    text: 'NotionNik\'s AI content pipeline completely changed our marketing workflow. We\'re producing 5x more content with the same team size. The quality is consistent and the process is seamless.',
    tag: 'AI Integration',
  },
  {
    name: 'Casey Ngo', role: 'Startup Founder', avatar: 'CN', rating: 5,
    text: 'As a solo founder, I was spending 40% of my time on admin. NotionNik automated my CRM, invoicing, and weekly reports. Now that 40% goes into actually growing the business.',
    tag: 'Workflow Automation',
  },
  {
    name: 'Riley Evans', role: 'Agency Owner', avatar: 'RE', rating: 5,
    text: 'Our client reporting used to take 2 days a month. NotionNik built an automated system that compiles all our reports in real time. Our clients love the new dashboards too.',
    tag: 'Reporting',
  },
  {
    name: 'Drew Malik', role: 'COO, TechVenture', avatar: 'DM', rating: 5,
    text: 'We hired NotionNik to build our internal operations OS in Notion. Six months later, it\'s become the backbone of our entire company. Best investment we\'ve made.',
    tag: 'Notion Workspace',
  },
]

const COLORS = ['#2d8ef5','#1a5fc0','#5aabff','#2d8ef5','#1a5fc0','#5aabff','#2d8ef5','#1a5fc0']

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length:n}).map((_,i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
      ))}
    </div>
  )
}

function TestimonialCard({ t, i, style }) {
  return (
    <div className="card-glass p-7 flex flex-col gap-4 h-full" style={{ ...style }}>
      <div className="flex items-start justify-between">
        <Stars />
        <span className="tag text-[9px]">{t.tag}</span>
      </div>
      <p className="text-blue-100/80 text-[14px] leading-relaxed flex-1">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${COLORS[i]}, ${COLORS[i]}80)` }}
        >{t.avatar}</div>
        <div>
          <p className="font-display font-bold text-white text-sm">{t.name}</p>
          <p className="text-blue-300/50 text-[11px]">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setActive(a => (a+1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [])

  const featured = TESTIMONIALS[active]

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Social Proof</p>
          <h1 className="section-title text-white mb-4">
            What Clients <span className="gradient-text-blue">Say</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Don't take our word for it. Hear from the founders and teams we've helped automate their way to freedom.
          </p>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="py-16 bg-navy-900/30 border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 border border-brand-500/20 p-10 md:p-14">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-500/8 blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Stars />
                <span className="tag">{featured.tag}</span>
              </div>
              <p className="font-display text-xl md:text-2xl text-white leading-relaxed mb-8 font-semibold">
                "{featured.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center font-bold text-white">{featured.avatar}</div>
                <div>
                  <p className="font-display font-bold text-white">{featured.name}</p>
                  <p className="text-blue-300/60 text-sm">{featured.role}</p>
                </div>
              </div>
              {/* Dots */}
              <div className="flex gap-2 mt-8">
                {TESTIMONIALS.map((_,i) => (
                  <button key={i} onClick={() => { setActive(i); clearInterval(timerRef.current) }}
                    className="transition-all duration-300 rounded-full"
                    style={{ width: i===active ? 28 : 8, height: 8, background: i===active ? '#2d8ef5' : 'rgba(45,142,245,0.2)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All testimonials grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <h2 className="section-title text-white mb-10 text-2xl">All Reviews</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="break-inside-avoid">
                <TestimonialCard t={t} i={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overall stats */}
      <section className="py-14 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: '5.0', label: 'Average Rating', suffix: '/5' },
              { val: '30+', label: 'Happy Clients',   suffix: ''  },
              { val: '50+', label: 'Projects Done',   suffix: ''  },
              { val: '100%', label: 'Would Recommend', suffix: '' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display text-4xl font-extrabold stat-number mb-1">{s.val}<span className="text-2xl text-blue-300/50">{s.suffix}</span></div>
                <p className="font-mono text-[11px] tracking-widest uppercase text-blue-400/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
          <h2 className="section-title text-white mb-4">Ready to join them?</h2>
          <p className="text-blue-200/55 text-base mb-8 max-w-md mx-auto">Book a free discovery call and let's build something you'll rave about too.</p>
          <Link to="/book">
            <button className="btn-primary text-base px-8 py-4"><span>Book Free Call →</span></button>
          </Link>
        </div>
      </section>
    </main>
  )
}
