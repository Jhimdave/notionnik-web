import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useTheme } from '../pages/ThemeContext'

const LINKS = [
  { label: 'Home',         to: '/'            },
  { label: 'Services',     to: '/services'    },
  { label: 'Case Studies', to: '/case-studies'},
  { label: 'Testimonials', to: '/testimonials'},
  { label: 'About',        to: '/about'       },
  { label: 'Contact',      to: '/contact'     },
]

// Theme Toggle Button Component
function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  
  return (
    <button
      onClick={toggle}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
        isDark 
          ? 'bg-navy-700/60 border border-white/10 text-blue-200/70 hover:text-white hover:border-brand-500/40' 
          : 'bg-white/80 border border-[rgba(45,142,245,0.2)] text-[#1a5fc0] hover:text-[#0d2b4d] hover:border-[rgba(45,142,245,0.4)]'
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon for dark mode (click to go light)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon icon for light mode (click to go dark)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [visible,   setVisible]   = useState(true)
  const [lastY,     setLastY]     = useState(0)
  const location = useLocation()
  const { isDark } = useTheme()

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
        ${scrolled 
          ? (isDark 
              ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/[0.06]' 
              : 'bg-white/80 backdrop-blur-xl border-b border-[rgba(45,142,245,0.15)]')
          : 'bg-transparent'
        }
        ${visible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo size={40} showText={true} theme={isDark}/>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <Link
              key={l.to} to={l.to}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-body
                ${isActive(l.to)
                  ? (isDark 
                      ? 'text-white bg-brand-500/15 border border-brand-500/25' 
                      : 'text-[#0d2b4d] bg-[rgba(45,142,245,0.12)] border border-[rgba(45,142,245,0.3)]')
                  : (isDark 
                      ? 'text-blue-200/60 hover:text-white hover:bg-white/5' 
                      : 'text-[#1a3a5c] hover:text-[#0d2b4d] hover:bg-[rgba(45,142,245,0.08)]')
                }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isDark ? 'bg-brand-400' : 'bg-[#2d8ef5]'}`} />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark 
              ? 'bg-emerald-400/10 border-emerald-400/20' 
              : 'bg-[rgba(45,142,245,0.1)] border-[rgba(45,142,245,0.25)]'
          }`}>
            <span className="status-live" />
            <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${
              isDark ? 'text-emerald-400' : 'text-[#1a5fc0]'
            }`}>Open for Work</span>
          </div>
          <Link to="/book">
            <button className="btn-primary text-sm px-5 py-2.5">
              <span>Book Free Call</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
          {/* Theme Toggle - Far Right */}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className={`md:hidden w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1.5 ${
            isDark 
              ? 'bg-navy-700/60 border border-white/10' 
              : 'bg-white/80 border border-[rgba(45,142,245,0.2)]'
          }`}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''} ${isDark ? 'bg-white' : 'bg-[#0d2b4d]'}`} />
          <span className={`block w-5 h-0.5 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''} ${isDark ? 'bg-white' : 'bg-[#0d2b4d]'}`} />
          <span className={`block w-5 h-0.5 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''} ${isDark ? 'bg-white' : 'bg-[#0d2b4d]'}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`px-5 py-4 flex flex-col gap-1 backdrop-blur-xl ${
          isDark 
            ? 'bg-navy-900/97 border-b border-white/[0.07]' 
            : 'bg-white/95 border-b border-[rgba(45,142,245,0.15)]'
        }`}>
          {LINKS.map(l => (
            <Link
              key={l.to} to={l.to}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all font-body
                ${isActive(l.to)
                  ? (isDark 
                      ? 'text-white bg-brand-500/15 border border-brand-500/25' 
                      : 'text-[#0d2b4d] bg-[rgba(45,142,245,0.12)] border border-[rgba(45,142,245,0.3)]')
                  : (isDark 
                      ? 'text-blue-200/60 hover:text-white hover:bg-white/5' 
                      : 'text-[#1a3a5c] hover:text-[#0d2b4d] hover:bg-[rgba(45,142,245,0.08)]')
                }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 pb-1 flex flex-col gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border w-fit ${
              isDark 
                ? 'bg-emerald-400/10 border-emerald-400/20' 
                : 'bg-[rgba(45,142,245,0.1)] border-[rgba(45,142,245,0.25)]'
            }`}>
              <span className="status-live" />
              <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${
                isDark ? 'text-emerald-400' : 'text-[#1a5fc0]'
              }`}>Open for Work</span>
            </div>
            <Link to="/book">
              <button className="btn-primary w-full justify-center">
                <span>Book Free Call</span>
              </button>
            </Link>
            {/* Mobile Theme Toggle */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
              isDark 
                ? 'bg-navy-800/50 border-white/[0.06]' 
                : 'bg-[rgba(45,142,245,0.08)] border-[rgba(45,142,245,0.15)]'
            }`}>
              <span className={`text-sm font-semibold ${isDark ? 'text-blue-200/60' : 'text-[#1a3a5c]'}`}>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}