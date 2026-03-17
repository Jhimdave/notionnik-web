import { useState, useEffect, useRef, useCallback } from 'react'

const MESSAGES = [
  { text: 'Need help?', icon: '💬' },
  { text: 'Hey there!', icon: '👋' },
  { text: "Let's automate!", icon: '⚡' },
  { text: 'I can help!', icon: '✨' },
  { text: 'Notion expert!', icon: '📋' },
  { text: 'Got questions?', icon: '❓' },
  { text: 'Say hello! 👋', icon: null },
  { text: 'Free consult?', icon: '🎯' },
  { text: 'Watch this!', icon: '🤖' },
  { text: 'Beep boop!', icon: '🔊' },
]

const EXPRESSIONS = {
  neutral: {
    lEye: { cx: 28, cy: 32, rx: 6, ry: 6 },
    rEye: { cx: 52, cy: 32, rx: 6, ry: 6 },
    lp: { x: 29.5, y: 33.5 }, rp: { x: 53.5, y: 33.5 },
    smile: 'M 22 48 Q 40 55 58 48',
    lBrow: 'M 21 22 Q 28 20 35 22',
    rBrow: 'M 45 22 Q 52 20 59 22',
    blush: false,
  },
  happy: {
    lEye: { cx: 28, cy: 31, rx: 6, ry: 5.5 },
    rEye: { cx: 52, cy: 31, rx: 6, ry: 5.5 },
    lp: { x: 29.5, y: 32.5 }, rp: { x: 53.5, y: 32.5 },
    smile: 'M 20 46 Q 40 62 60 46',
    lBrow: 'M 21 19 Q 28 14 35 18',
    rBrow: 'M 45 18 Q 52 14 59 19',
    blush: true,
  },
  excited: {
    lEye: { cx: 28, cy: 30, rx: 7, ry: 6 },
    rEye: { cx: 52, cy: 30, rx: 7, ry: 6 },
    lp: { x: 30, y: 31.5 }, rp: { x: 54, y: 31.5 },
    smile: 'M 18 44 Q 40 66 62 44',
    lBrow: 'M 19 16 Q 28 10 37 16',
    rBrow: 'M 43 16 Q 52 10 61 16',
    blush: true,
  },
  curious: {
    lEye: { cx: 28, cy: 33, rx: 6, ry: 5 },
    rEye: { cx: 52, cy: 31, rx: 6, ry: 7 },
    lp: { x: 29.5, y: 34 }, rp: { x: 53.5, y: 32 },
    smile: 'M 25 50 Q 36 52 54 46',
    lBrow: 'M 21 24 Q 28 22 35 24',
    rBrow: 'M 45 18 Q 52 14 59 18',
    blush: false,
  },
  surprised: {
    lEye: { cx: 28, cy: 30, rx: 7.5, ry: 8.5 },
    rEye: { cx: 52, cy: 30, rx: 7.5, ry: 8.5 },
    lp: { x: 29.5, y: 31.5 }, rp: { x: 53.5, y: 31.5 },
    smile: 'M 30 50 Q 40 46 50 50',
    lBrow: 'M 19 16 Q 27 10 36 16',
    rBrow: 'M 44 16 Q 53 10 61 16',
    blush: false,
  },
  wink: {
    lEye: { cx: 28, cy: 32, rx: 6, ry: 6 },
    rEye: { cx: 52, cy: 32, rx: 6, ry: 1.5 },
    lp: { x: 29.5, y: 33.5 }, rp: { x: 53.5, y: 32 },
    smile: 'M 20 47 Q 40 60 60 47',
    lBrow: 'M 21 22 Q 28 18 35 22',
    rBrow: 'M 45 24 Q 52 20 59 24',
    blush: true,
  },
  sleepy: {
    lEye: { cx: 28, cy: 34, rx: 6, ry: 2.5 },
    rEye: { cx: 52, cy: 34, rx: 6, ry: 2.5 },
    lp: { x: 29.5, y: 35 }, rp: { x: 53.5, y: 35 },
    smile: 'M 25 52 Q 40 54 55 50',
    lBrow: 'M 21 25 Q 28 24 35 25',
    rBrow: 'M 45 25 Q 52 24 59 25',
    blush: false,
  },
  love: {
    lEye: { cx: 28, cy: 32, rx: 6, ry: 6 },
    rEye: { cx: 52, cy: 32, rx: 6, ry: 6 },
    lp: { x: 29.5, y: 33.5 }, rp: { x: 53.5, y: 33.5 },
    smile: 'M 20 46 Q 40 60 60 46',
    lBrow: 'M 21 20 Q 28 16 35 20',
    rBrow: 'M 45 20 Q 52 16 59 20',
    blush: true,
    hearts: true,
  },
}
const EXPR_KEYS = Object.keys(EXPRESSIONS)

// Movement types
const MOVEMENTS = {
  WALK: 'walk',
  FLY: 'fly',
  DANCE: 'dance',
  PEEK: 'peek',
  JUMP: 'jump',
  HOVER: 'hover',
}

/* ── Modern Robot HEAD SVG with expressions ───────────────────────── */
function RobotHead({ expression = 'neutral', side = 'right', scale = 1 }) {
  const ex = EXPRESSIONS[expression]
  const flipX = side === 'right' ? -1 : 1

  return (
    <svg
      width={100 * scale}
      height={140 * scale}
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transform: `scaleX(${flipX})`,
        transformOrigin: 'center',
        overflow: 'visible',
        filter: 'drop-shadow(0 8px 32px rgba(45,142,245,0.4)) drop-shadow(0 4px 16px rgba(2,16,36,0.5))',
      }}
    >
      <defs>
        <linearGradient id="hG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F4F8" />
          <stop offset="50%" stopColor="#7DA0CA" />
          <stop offset="100%" stopColor="#2D8EF5" />
        </linearGradient>
        <linearGradient id="armG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5AABFF" />
          <stop offset="100%" stopColor="#1A5FC0" />
        </linearGradient>
        <linearGradient id="vG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D2B4D" />
          <stop offset="100%" stopColor="#021024" />
        </linearGradient>
        <radialGradient id="eG" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#C1E8FF" />
          <stop offset="100%" stopColor="#2D8EF5" />
        </radialGradient>
        <radialGradient id="glG" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2D8EF5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2D8EF5" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#021024" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* NECK */}
      <rect x="38" y="95" width="24" height="16" rx="8" fill="#1A5FC0" opacity="0.9" />
      <rect x="40" y="98" width="20" height="2" rx="1" fill="#5AABFF" opacity="0.5" />

      {/* SHOULDERS */}
      <ellipse cx="20" cy="115" rx="18" ry="12" fill="url(#hG)" filter="url(#softShadow)" />
      <ellipse cx="80" cy="115" rx="18" ry="12" fill="url(#hG)" filter="url(#softShadow)" />
      <rect x="5" y="115" width="20" height="35" rx="10" fill="url(#armG)" />
      <rect x="75" y="115" width="20" height="35" rx="10" fill="url(#armG)" />
      <circle cx="15" cy="145" r="7" fill="#2D8EF5" />
      <circle cx="15" cy="145" r="4" fill="#5AABFF" />
      <circle cx="85" cy="145" r="7" fill="#2D8EF5" />
      <circle cx="85" cy="145" r="4" fill="#5AABFF" />

      {/* HEAD SHELL */}
      <rect x="15" y="8" width="70" height="90" rx="28" fill="url(#hG)" filter="url(#softShadow)" />
      <ellipse cx="35" cy="22" rx="20" ry="12" fill="white" opacity="0.25" />
      <rect x="15" y="8" width="70" height="90" rx="28" fill="none" stroke="#5AABFF" strokeWidth="1.5" opacity="0.4" />

      {/* EARS */}
      <rect x="8" y="35" width="10" height="28" rx="5" fill="url(#armG)" />
      <circle cx="13" cy="49" r="5" fill="#0D2B4D" />
      <circle cx="13" cy="49" r="3" fill="#2D8EF5" filter="url(#glow)" />
      <rect x="82" y="35" width="10" height="28" rx="5" fill="url(#armG)" />
      <circle cx="87" cy="49" r="5" fill="#0D2B4D" />
      <circle cx="87" cy="49" r="3" fill="#2D8EF5" filter="url(#glow)" />

      {/* ANTENNA */}
      <line x1="50" y1="8" x2="50" y2="-8" stroke="#5AABFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="-12" r="7" fill="#2D8EF5" filter="url(#glow)" />
      <circle cx="50" cy="-12" r="4" fill="white" opacity="0.9" />

      {/* VISOR */}
      <rect x="22" y="20" width="56" height="58" rx="20" fill="url(#vG)" />
      <rect x="22" y="20" width="56" height="58" rx="20" fill="none" stroke="#2D8EF5" strokeWidth="1.5" opacity="0.5" />
      <rect x="24" y="22" width="52" height="20" rx="16" fill="white" opacity="0.08" />

      {/* EYEBROWS */}
      <path d={ex.lBrow} fill="none" stroke="#E8F4F8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d={ex.rBrow} fill="none" stroke="#E8F4F8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

      {/* EYES */}
      <ellipse cx={ex.lEye.cx} cy={ex.lEye.cy} rx={ex.lEye.rx} ry={ex.lEye.ry} fill="url(#eG)" filter="url(#glow)" />
      <ellipse cx={ex.lEye.cx} cy={ex.lEye.cy} rx={ex.lEye.rx * 0.45} ry={ex.lEye.ry * 0.45} fill="#0D2B4D" />
      <circle cx={ex.lp.x} cy={ex.lp.y} r="2.2" fill="white" opacity="0.95" />
      <ellipse cx={ex.rEye.cx} cy={ex.rEye.cy} rx={ex.rEye.rx} ry={ex.rEye.ry} fill="url(#eG)" filter="url(#glow)" />
      <ellipse cx={ex.rEye.cx} cy={ex.rEye.cy} rx={ex.rEye.rx * 0.45} ry={ex.rEye.ry * 0.45} fill="#0D2B4D" />
      <circle cx={ex.rp.x} cy={ex.rp.y} r="2.2" fill="white" opacity="0.95" />

      {/* HEARTS for love expression */}
      {ex.hearts && (
        <>
          <text x="12" y="28" fontSize="12" fill="#FF6B9D" opacity="0.8">💕</text>
          <text x="72" y="28" fontSize="12" fill="#FF6B9D" opacity="0.8">💕</text>
        </>
      )}

      {/* BLUSH */}
      {ex.blush && (
        <>
          <ellipse cx="22" cy="52" rx="7" ry="4" fill="#FF6B9D" opacity="0.25" />
          <ellipse cx="68" cy="52" rx="7" ry="4" fill="#FF6B9D" opacity="0.25" />
        </>
      )}

      {/* MOUTH */}
      <path d={ex.smile} fill="none" stroke="#E8F4F8" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />

      {/* AMBIENT GLOW */}
      <ellipse cx="50" cy="50" rx="38" ry="32" fill="url(#glG)" />
    </svg>
  )
}

/* ── Speech Bubble ──────────────────────────────────────────────── */
function SpeechBubble({ msg, side, visible }) {
  return (
    <div
      style={{
        position: 'absolute',
        [side === 'right' ? 'right' : 'left']: '95px',
        top: '10px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateX(0)' : `scale(0.9) translateX(${side === 'right' ? '15px' : '-15px'})`,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
        zIndex: 10,
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13,43,77,0.98), rgba(2,16,36,0.99))',
          border: '2px solid rgba(45,142,245,0.5)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(2,16,36,0.5), 0 0 20px rgba(45,142,245,0.2)',
        }}
      >
        {msg.icon && <span style={{ fontSize: '16px' }}>{msg.icon}</span>}
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#E8F4F8',
          }}
        >
          {msg.text}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          [side === 'right' ? 'right' : 'left']: '-12px',
          [side === 'right' ? 'borderLeft' : 'borderRight']: '12px solid rgba(13,43,77,0.98)',
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
        }}
      />
    </div>
  )
}

/* ── Particle effects for movement ──────────────────────────────── */
function Particles({ active, type }) {
  if (!active) return null
  
  const getParticles = () => {
    switch (type) {
      case MOVEMENTS.FLY:
        return (
          <>
            <div className="particle trail-1" />
            <div className="particle trail-2" />
            <div className="particle trail-3" />
          </>
        )
      case MOVEMENTS.JUMP:
        return <div className="particle dust" />
      case MOVEMENTS.DANCE:
        return (
          <>
            <div className="particle note-1">🎵</div>
            <div className="particle note-2">✨</div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -1 }}>
      {getParticles()}
    </div>
  )
}

export default function AnimatedRobot({ onOpenChat }) {
  // State
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [side, setSide] = useState('right')
  const [expression, setExpression] = useState('neutral')
  const [movement, setMovement] = useState(MOVEMENTS.HOVER)
  const [msgIdx, setMsgIdx] = useState(0)
  const [showBubble, setShowBubble] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [scale, setScale] = useState(1)
  
  // Refs
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const timersRef = useRef([])
  const posRef = useRef({ x: 0, y: 0 })
  const movementRef = useRef(movement)
  movementRef.current = movement

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  const schedule = (fn, ms) => {
    const t = setTimeout(fn, ms)
    timersRef.current.push(t)
    return t
  }

  // Movement animations
  const animateWalk = useCallback((targetX, targetY, duration = 2000) => {
    const startX = posRef.current.x
    const startY = posRef.current.y
    const startTime = performance.now()
    const isRight = targetX > startX

    setExpression('happy')
    setScale(1)
    
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      
      const currentX = startX + (targetX - startX) * ease
      const bobY = Math.sin(progress * Math.PI * 8) * 8 // Walking bob
      const currentY = startY + (targetY - startY) * ease + bobY
      
      posRef.current = { x: currentX, y: currentY }
      setPosition({ x: currentX, y: currentY })
      
      // Wave while walking
      if (progress < 1) {
        setExpression(progress % 0.5 < 0.25 ? 'happy' : 'wink')
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        setExpression('neutral')
      }
    }
    
    animationRef.current = requestAnimationFrame(step)
  }, [])

  const animateFly = useCallback((targetX, targetY, duration = 1500) => {
    const startX = posRef.current.x
    const startY = posRef.current.y
    const startTime = performance.now()

    setExpression('excited')
    setScale(0.9)

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 2)
      
      // Arc trajectory
      const arcHeight = 150 * Math.sin(progress * Math.PI)
      const currentX = startX + (targetX - startX) * ease
      const currentY = startY + (targetY - startY) * ease - arcHeight
      
      posRef.current = { x: currentX, y: currentY }
      setPosition({ x: currentX, y: currentY })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        setScale(1)
        setExpression('happy')
      }
    }
    
    animationRef.current = requestAnimationFrame(step)
  }, [])

  const animateJump = useCallback(() => {
    const baseY = posRef.current.y
    const startTime = performance.now()
    
    setExpression('surprised')
    
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / 800, 1)
      
      // Parabolic jump
      const jumpHeight = 120 * Math.sin(progress * Math.PI)
      const currentY = baseY - jumpHeight
      
      posRef.current = { ...posRef.current, y: currentY }
      setPosition(prev => ({ ...prev, y: currentY }))
      
      // Spin effect
      const rotation = progress * 360

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        setExpression('excited')
        schedule(() => setExpression('neutral'), 500)
      }
    }
    
    animationRef.current = requestAnimationFrame(step)
  }, [])

  const animateDance = useCallback((duration = 3000) => {
    const startX = posRef.current.x
    const startY = posRef.current.y
    const startTime = performance.now()
    
    setExpression('love')
    setScale(1.1)

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Dance moves - side to side with bounce
      const danceX = Math.sin(progress * Math.PI * 6) * 40
      const danceY = Math.abs(Math.sin(progress * Math.PI * 12)) * -20
      const rotation = Math.sin(progress * Math.PI * 4) * 15
      
      posRef.current = { x: startX + danceX, y: startY + danceY }
      setPosition({ x: startX + danceX, y: startY + danceY })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        posRef.current = { x: startX, y: startY }
        setPosition({ x: startX, y: startY })
        setScale(1)
        setExpression('happy')
      }
    }
    
    animationRef.current = requestAnimationFrame(step)
  }, [])

  const animatePeek = useCallback((peekSide) => {
    const isRight = peekSide === 'right'
    const hiddenX = isRight ? window.innerWidth + 100 : -150
    const peekX = isRight ? window.innerWidth - 130 : 30
    
    posRef.current = { x: hiddenX, y: window.innerHeight / 2 }
    setPosition({ x: hiddenX, y: window.innerHeight / 2 })
    setSide(peekSide)
    setExpression('curious')
    
    // Peek in
    schedule(() => {
      setVisible(true)
      animateWalk(peekX, window.innerHeight / 2, 800)
      
      // Peek out
      schedule(() => {
        setExpression('wink')
        schedule(() => {
          animateWalk(hiddenX, window.innerHeight / 2, 600)
          schedule(() => {
            setVisible(false)
            scheduleNext()
          }, 700)
        }, 1500)
      }, 2000)
    }, 100)
  }, [animateWalk])

  // Main sequence
  const performRoutine = useCallback(() => {
    const routines = [
      // Walk from right to left saying hi
      () => {
        setSide('left')
        posRef.current = { x: window.innerWidth + 100, y: 200 }
        setPosition({ x: window.innerWidth + 100, y: 200 })
        setMovement(MOVEMENTS.WALK)
        setVisible(true)
        setShowBubble(true)
        setMsgIdx(1) // "Hey there!"
        
        animateWalk(-150, 200, 4000)
        
        schedule(() => setShowBubble(false), 2500)
        schedule(() => {
          setVisible(false)
          scheduleNext()
        }, 4200)
      },
      
      // Fly across screen
      () => {
        const startY = 150 + Math.random() * 200
        setSide('right')
        posRef.current = { x: -150, y: startY }
        setPosition({ x: -150, y: startY })
        setMovement(MOVEMENTS.FLY)
        setVisible(true)
        setExpression('excited')
        
        animateFly(window.innerWidth + 150, startY, 2500)
        
        schedule(() => {
          setVisible(false)
          scheduleNext()
        }, 2600)
      },
      
      // Dance in corner
      () => {
        const cornerX = window.innerWidth - 150
        const cornerY = window.innerHeight - 200
        setSide('right')
        posRef.current = { x: cornerX, y: cornerY }
        setPosition({ x: cornerX, y: cornerY })
        setMovement(MOVEMENTS.DANCE)
        setVisible(true)
        setShowBubble(true)
        setMsgIdx(8) // "Watch this!"
        
        animateDance(3500)
        
        schedule(() => setShowBubble(false), 2500)
        schedule(() => {
          setVisible(false)
          scheduleNext()
        }, 3700)
      },
      
      // Jump up from bottom
      () => {
        const x = 100 + Math.random() * (window.innerWidth - 200)
        setSide(x > window.innerWidth / 2 ? 'right' : 'left')
        posRef.current = { x, y: window.innerHeight + 150 }
        setPosition({ x, y: window.innerHeight + 150 })
        setMovement(MOVEMENTS.JUMP)
        setVisible(true)
        setExpression('surprised')
        
        // Walk up first
        animateWalk(x, window.innerHeight - 150, 600)
        
        schedule(() => {
          animateJump()
          setShowBubble(true)
          setMsgIdx(3) // "I can help!"
          schedule(() => setShowBubble(false), 1500)
        }, 700)
        
        schedule(() => {
          animateWalk(x, window.innerHeight + 150, 500)
          schedule(() => {
            setVisible(false)
            scheduleNext()
          }, 600)
        }, 2500)
      },
      
      // Peeking from side
      () => {
        setMovement(MOVEMENTS.PEEK)
        animatePeek(Math.random() > 0.5 ? 'right' : 'left')
      },
    ]
    
    const routine = routines[Math.floor(Math.random() * routines.length)]
    routine()
  }, [animateWalk, animateFly, animateDance, animateJump, animatePeek])

  const scheduleNext = () => {
    const delay = 3000 + Math.random() * 5000
    schedule(() => performRoutine(), delay)
  }

  // Initial start
  useEffect(() => {
    schedule(() => performRoutine(), 2000)
    return () => clearTimers()
  }, [])

  // Message rotation while visible
  useEffect(() => {
    if (!visible) return
    const iv = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(iv)
  }, [visible])

  // Hover handlers
  const handleMouseEnter = () => {
    setIsHovered(true)
    setExpression('love')
    setScale(1.15)
    clearTimers()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setExpression('neutral')
    setScale(1)
    scheduleNext()
  }

  const handleClick = () => {
    clearTimers()
    onOpenChat()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes flyTrail {
          0% { transform: translateX(0) scale(1); opacity: 0.6; }
          100% { transform: translateX(-60px) scale(0.5); opacity: 0; }
        }
        @keyframes dust {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
        }
        @keyframes noteFloat {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-50px) translateX(20px) rotate(20deg); opacity: 0; }
        }
        .particle {
          position: absolute;
          pointer-events: none;
        }
        .trail-1, .trail-2, .trail-3 {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(45,142,245,0.6), transparent);
          border-radius: 50%;
          animation: flyTrail 0.6s ease-out infinite;
        }
        .trail-1 { left: -30px; top: 50%; animation-delay: 0s; }
        .trail-2 { left: -50px; top: 40%; animation-delay: 0.2s; }
        .trail-3 { left: -40px; top: 60%; animation-delay: 0.1s; }
        .dust {
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(200,200,200,0.4), transparent);
          border-radius: 50%;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          animation: dust 0.8s ease-out infinite;
        }
        .note-1, .note-2 {
          font-size: 20px;
          animation: noteFloat 1.5s ease-out infinite;
        }
        .note-1 { top: -30px; left: 20%; animation-delay: 0s; }
        .note-2 { top: -40px; right: 20%; animation-delay: 0.5s; }
        .robot-container {
          cursor: pointer;
          transition: filter 0.3s ease;
        }
        .robot-container:hover {
          filter: brightness(1.1) drop-shadow(0 0 30px rgba(45,142,245,0.6));
        }
      `}</style>

      <div
        ref={containerRef}
        className="robot-container"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
          transform: `scale(${scale})`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: movement === MOVEMENTS.HOVER ? 'float 3s ease-in-out infinite' : 'none',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Particles active={movement === MOVEMENTS.FLY || movement === MOVEMENTS.JUMP || movement === MOVEMENTS.DANCE} type={movement} />
          
          <SpeechBubble 
            msg={MESSAGES[msgIdx]} 
            side={side} 
            visible={showBubble || isHovered}
          />
          
          <div style={{ animation: movement === MOVEMENTS.WALK ? 'none' : undefined }}>
            <RobotHead 
              expression={isHovered ? 'love' : expression} 
              side={side}
              scale={1}
            />
          </div>
        </div>
      </div>
    </>
  )
}