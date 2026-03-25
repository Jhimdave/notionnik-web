import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useTheme } from '../pages/ThemeContext'

const SOCIALS = [
  {
    label: 'Instagram', href: 'https://www.instagram.com/notionnik/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.239 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.239-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.239-2.242-1.301-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.239 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.612.074-3.055.4-4.209 1.554C1.69 2.78 1.364 4.223 1.29 5.835 1.232 7.115 1.218 7.523 1.218 12s.014 4.885.072 6.165c.074 1.612.4 3.055 1.554 4.209 1.154 1.154 2.597 1.48 4.209 1.554C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.612-.074 3.055-.4 4.209-1.554 1.154-1.154 1.48-2.597 1.554-4.209.058-1.28.072-1.688.072-6.165s-.014-4.885-.072-6.165c-.074-1.612-.4-3.055-1.554-4.209C19.002.472 17.559.146 15.947.072 14.667.014 14.259 0 12 0z"/></svg>
  },
  {
    label: 'WhatsApp', href: 'https://wa.me/639325417031',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  },
  {
    label: 'LinkedIn', href: 'https://www.linkedin.com/company/103721418/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
  },
  {
    label: 'Facebook', href: 'https://www.facebook.com/notionnik/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H8.08V12h2.36v-2.05c0-2.33 1.39-3.62 3.51-3.62.69 0 1.53.12 2.22.24v2.44h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.99A10 10 0 0022 12z"/></svg>
  },
  {
    label: 'Upwork', href: 'https://www.upwork.com/agencies/1768339692736311296/',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.56 12.67c-1.1 0-2.13-.42-2.93-1.09l.22-1.02.01-.07c.19-1.07.78-2.87 2.7-2.87a2.53 2.53 0 012.53 2.53 2.53 2.53 0 01-2.53 2.52zm0-7.1c-2.6 0-4.63 1.7-5.48 4.46-.79-1.41-1.39-3.1-1.74-4.53H8.87v5.5a2.36 2.36 0 01-2.35 2.35 2.36 2.36 0 01-2.36-2.35V5.5H1.69v5.5a4.84 4.84 0 004.83 4.84 4.84 4.84 0 004.84-4.84v-.92c.34.73.76 1.47 1.25 2.14L10.9 18.5h2.42l1.09-4.01c.96.62 2.07.98 3.24.98 3.05 0 5.2-2.23 5.2-5.02a5.02 5.02 0 00-5.02-5.02z"/></svg>
  },
]

const NAV_COLS = [
  { title: 'Pages', links: [
    { label: 'Home',         to: '/'             },
    { label: 'Services',     to: '/services'     },
    { label: 'Case Studies', to: '/case-studies' },
    { label: 'Testimonials', to: '/testimonials' },
    { label: 'About Us',     to: '/about'        },
    { label: 'Contact',      to: '/contact'      },
    { label: 'Book a Call',  to: '/book'         },
  ]},
  { title: 'Services', links: [
    { label: 'Notion Workspaces',    to: '/services' },
    { label: 'Workflow Automation',  to: '/services' },
    { label: 'AI Integrations',      to: '/services' },
    { label: 'Google Workspace',     to: '/services' },
    { label: 'API Connections',      to: '/services' },
  ]},
]

const PRIVACY_SECTIONS = [
  ['Information We Collect', 'When you use our services or contact us, we may collect your name, email address, and any information you voluntarily provide. We do not collect sensitive personal data unless explicitly required for service delivery.'],
  ['How We Use It', 'We use collected information to respond to inquiries, schedule consultations, deliver automation services, and improve your experience. We do not sell, rent, or trade personal data to third parties under any circumstances.'],
  ['Cookies & Analytics', 'Our site uses minimal analytics to understand visitor behavior and improve performance. No personally identifiable data is used for advertising. You may disable cookies in your browser settings at any time.'],
  ['Third-Party Services', 'We use tools such as Notion, n8n, Make, and scheduling platforms. Each has their own privacy policies. We are not responsible for data practices of third-party tools.'],
  ['Data Security', 'We implement reasonable technical and organizational measures to protect your personal information. No method of internet transmission is 100% secure, but we follow industry best practices.'],
  ['Your Rights', 'You may request access to, correction of, or deletion of your personal data at any time by contacting us directly via WhatsApp or Instagram.'],
]

function PrivacyModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[82vh] bg-navy-900 border border-white/10 rounded-2xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="font-display font-bold text-sm text-white">Privacy Policy</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-navy-700 border border-white/10 flex items-center justify-center text-blue-200/60 hover:text-white transition-colors text-xs">✕</button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-blue-100/75 leading-relaxed">
          <p className="font-mono text-[10px] text-blue-400/50 tracking-widest uppercase">Last updated {new Date().getFullYear()}</p>
          {PRIVACY_SECTIONS.map(([h, b]) => (
            <section key={h}>
              <h3 className="font-display font-bold text-white text-[15px] mb-2">{h}</h3>
              <p>{b}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  const [privacy, setPrivacy] = useState(false)
  const { isDark } = useTheme()

  return (
    <>
      {privacy && <PrivacyModal onClose={() => setPrivacy(false)} />}
      <footer className="border-t border-white/[0.06] bg-navy-950/80 backdrop-blur-xl pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Logo size={40} showText={true} className="mb-5" theme = { isDark }/>
              <p className="text-blue-200/55 text-[13.5px] leading-relaxed mb-5 max-w-[230px]">
                We build smart Notion systems and automation workflows that save time and scale your business.
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 w-fit mb-5">
                <span className="status-live" />
                <span className="font-mono text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">Open for Projects</span>
              </div>
              {/* Socials */}
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-xl bg-navy-700/60 border border-white/[0.08] flex items-center justify-center text-blue-300/50 hover:text-brand-400 hover:border-brand-500/40 hover:bg-brand-500/10 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {NAV_COLS.map(col => (
              <div key={col.title}>
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-brand-400/70 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-[13.5px] text-blue-200/50 hover:text-white transition-colors duration-150">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-brand-400/70 mb-4">Contact</p>
              <ul className="space-y-3">
                {[
                  { label: 'WhatsApp', val: '+63 966 367 1854', href: 'https://wa.me/639663671854' },
                  { label: 'Instagram', val: '@notionnik',       href: 'https://instagram.com/notionnik' },
                  { label: 'LinkedIn',  val: 'NotionNik',         href: 'https://linkedin.com/company/103721418' },
                  { label: 'Upwork',    val: 'View Profile',      href: 'https://www.upwork.com/agencies/1768339692736311296/' },
                ].map(c => (
                  <li key={c.label} className="flex flex-col">
                    <span className="font-mono text-[9px] font-semibold tracking-widest text-blue-400/40 uppercase mb-0.5">{c.label}</span>
                    <a href={c.href} target="_blank" rel="noopener noreferrer"
                      className="text-[13px] text-blue-200/60 hover:text-brand-400 transition-colors"
                    >{c.val}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="glow-divider mb-6" />

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[11px] text-blue-200/30 tracking-wider">
              © {new Date().getFullYear()} NotionNik. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setPrivacy(true)} className="font-mono text-[11px] text-blue-200/30 hover:text-brand-400 transition-colors tracking-wider">
                Privacy Policy
              </button>
              <span className="text-white/10">·</span>
              <span className="font-mono text-[11px] text-blue-200/30">System · Notion · Automation</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
