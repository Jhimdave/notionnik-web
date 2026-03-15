import { useState, useEffect, useRef } from 'react'

// Peeping sides and their CSS positions
const PEEP_CONFIGS = [
  {
    id: 'left',
    style: (show) => ({
      position: 'fixed',
      left: show ? '-8px' : '-72px',
      bottom: '160px',
      zIndex: 48,
      transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: 'scaleX(1)',
    }),
    rotation: '0deg',
    bodyDir: 'row',
  },
  {
    id: 'right',
    style: (show) => ({
      position: 'fixed',
      right: show ? '-8px' : '-72px',
      bottom: '200px',
      zIndex: 48,
      transition: 'right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: 'scaleX(-1)',
    }),
    rotation: '0deg',
    bodyDir: 'row',
  },
  {
    id: 'bottom-left',
    style: (show) => ({
      position: 'fixed',
      left: '120px',
      bottom: show ? '-8px' : '-80px',
      zIndex: 48,
      transition: 'bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }),
    rotation: '-90deg',
    bodyDir: 'row',
  },
]

// The robot SVG component
function RobotFace({ size = 64, questionVisible }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 4px 20px rgba(45,142,245,0.45))' }}
    >
      {/* Robot body / head */}
      <rect x="6" y="14" width="52" height="40" rx="12" fill="#2d8ef5"/>
      {/* Face panel */}
      <rect x="12" y="20" width="40" height="28" rx="7" fill="#1a2d5a" opacity="0.55"/>

      {/* Antenna */}
      <rect x="26" y="6" width="12" height="9" rx="3" fill="#2d8ef5" opacity="0.7"/>
      <circle cx="32" cy="5" r="4" fill="#5aabff"/>
      <circle cx="32" cy="5" r="2" fill="white" opacity="0.8"/>

      {/* Ear tabs */}
      <rect x="1" y="22" width="6" height="16" rx="3" fill="#1a5fc0"/>
      <rect x="57" y="22" width="6" height="16" rx="3" fill="#1a5fc0"/>

      {/* Eyes */}
      <circle cx="22" cy="32" r="6" fill="white" opacity="0.95"/>
      <circle cx="42" cy="32" r="6" fill="white" opacity="0.95"/>
      <circle cx="23" cy="33" r="2.5" fill="#1a2d5a"/>
      <circle cx="43" cy="33" r="2.5" fill="#1a2d5a"/>
      {/* Eye shine */}
      <circle cx="24" cy="31.5" r="1" fill="white"/>
      <circle cx="44" cy="31.5" r="1" fill="white"/>

      {/* Smile */}
      <path d="M20 42 Q32 49 44 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>

      {/* Speed lines on left side */}
      <line x1="1" y1="20" x2="7" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="26" x2="5" y2="26" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Question mark bubble - appears above robot */}
      {questionVisible && (
        <g style={{ animation: 'questionBounce 1s ease-in-out infinite' }}>
          <circle cx="50" cy="8" r="11" fill="#0d1b3e" stroke="#2d8ef5" strokeWidth="1.5"/>
          <text x="50" y="13" textAnchor="middle" fill="#5aabff" fontSize="13" fontWeight="700" fontFamily="sans-serif">?</text>
        </g>
      )}
    </svg>
  )
}

export default function PeepingRobot({ onOpenChat }) {
  const [currentPeep, setCurrentPeep] = useState(null) // which config is showing
  const [visible, setVisible]         = useState(false) // slide-in state
  const [qVisible, setQVisible]       = useState(false) // question mark
  const [hovered, setHovered]         = useState(false)
  const timerRef = useRef(null)
  const qTimerRef = useRef(null)
  const hideTimerRef = useRef(null)

  const schedulePeep = () => {
    // Random delay 8-18 seconds between appearances
    const delay = 8000 + Math.random() * 10000
    timerRef.current = setTimeout(() => {
      // Pick a random side
      const config = PEEP_CONFIGS[Math.floor(Math.random() * PEEP_CONFIGS.length)]
      setCurrentPeep(config)
      setVisible(true)

      // Show question mark after 1 second
      qTimerRef.current = setTimeout(() => setQVisible(true), 1000)

      // Auto-hide after 5–7 seconds (unless hovered)
      hideTimerRef.current = setTimeout(() => {
        if (!hovered) hide()
      }, 6000)
    }, delay)
  }

  const hide = () => {
    setQVisible(false)
    setVisible(false)
    // After animation completes, schedule next peep
    setTimeout(() => {
      setCurrentPeep(null)
      schedulePeep()
    }, 700)
  }

  useEffect(() => {
    // First peep after 4 seconds
    timerRef.current = setTimeout(() => {
      const config = PEEP_CONFIGS[0]
      setCurrentPeep(config)
      setVisible(true)
      qTimerRef.current = setTimeout(() => setQVisible(true), 1000)
      hideTimerRef.current = setTimeout(() => hide(), 6000)
    }, 4000)

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(qTimerRef.current)
      clearTimeout(hideTimerRef.current)
    }
  }, [])

  const handleClick = () => {
    clearTimeout(hideTimerRef.current)
    setQVisible(false)
    setVisible(false)
    setTimeout(() => {
      setCurrentPeep(null)
      schedulePeep()
    }, 700)
    onOpenChat()
  }

  if (!currentPeep) return (
    <style>{`
      @keyframes questionBounce {
        0%, 100% { transform: translateY(0px) scale(1); }
        50%       { transform: translateY(-3px) scale(1.1); }
      }
    `}</style>
  )

  return (
    <>
      <style>{`
        @keyframes questionBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-3px) scale(1.1); }
        }
        .peep-robot {
          cursor: none !important;
          user-select: none;
        }
        .peep-robot:hover { filter: brightness(1.15); }
      `}</style>

      <div
        style={currentPeep.style(visible)}
        className="peep-robot"
        onClick={handleClick}
        onMouseEnter={() => {
          setHovered(true)
          clearTimeout(hideTimerRef.current)
        }}
        onMouseLeave={() => {
          setHovered(false)
          hideTimerRef.current = setTimeout(() => hide(), 2000)
        }}
        title="Have a question? Click me!"
      >
        <div
          style={{
            transform: `rotate(${currentPeep.rotation})`,
            position: 'relative',
          }}
        >
          <RobotFace size={72} questionVisible={qVisible} />

          {/* Tooltip */}
          {hovered && (
            <div style={{
              position: 'absolute',
              top: '-44px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(13,27,62,0.95)',
              border: '1px solid rgba(45,142,245,0.35)',
              borderRadius: '10px',
              padding: '5px 12px',
              whiteSpace: 'nowrap',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              color: '#5aabff',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(45,142,245,0.2)',
            }}>
              Have a question? 💬
            </div>
          )}
        </div>
      </div>
    </>
  )
}
