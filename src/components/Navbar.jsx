import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const LINKS = [
  { label: 'Home',         to: '/'            },
  { label: 'Services',     to: '/services'    },
  { label: 'Case Studies', to: '/case-studies'},
  { label: 'Testimonials', to: '/testimonials'},
  { label: 'About',        to: '/about'       },
  { label: 'Contact',      to: '/contact'     },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [visible,   setVisible]   = useState(true)
  const [lastY,     setLastY]     = useState(0)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y < lastY || y < 80)
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}
        ${visible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo size={40} showText={true} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <Link
              key={l.to} to={l.to}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-body
                ${isActive(l.to)
                  ? 'text-white bg-brand-500/15 border border-brand-500/25'
                  : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="status-live" />
            <span className="font-mono text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">Open for Work</span>
          </div>
          <Link to="/book">
            <button className="btn-primary text-sm px-5 py-2.5">
              <span>Book Free Call</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden w-10 h-10 rounded-xl bg-navy-700/60 border border-white/10 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-navy-900/97 backdrop-blur-xl border-b border-white/[0.07] px-5 py-4 flex flex-col gap-1">
          {LINKS.map(l => (
            <Link
              key={l.to} to={l.to}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all font-body
                ${isActive(l.to)
                  ? 'text-white bg-brand-500/15 border border-brand-500/25'
                  : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 pb-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 w-fit">
              <span className="status-live" />
              <span className="font-mono text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">Open for Work</span>
            </div>
            <Link to="/book">
              <button className="btn-primary w-full justify-center">
                <span>Book Free Call</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
