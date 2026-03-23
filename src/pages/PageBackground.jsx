import { useEffect, useRef } from 'react'
import { useTheme } from '../pages/ThemeContext'

export default function PageBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, t = 0

    // ── resize ────────────────────────────────────────────────────────────────
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // ── Orbs (ambient light blobs) ────────────────────────────────────────────
    const orbs = [
      { x: 0.12, y: 0.20, r: 200, col: isDark ? 'rgba(45,142,245,0.07)' : 'rgba(45,142,245,0.08)', dx: 0.00011, dy: 0.00007 },
      { x: 0.82, y: 0.65, r: 260, col: isDark ? 'rgba(26,45,90,0.10)'  : 'rgba(26,45,90,0.05)',   dx: -0.00009, dy: 0.00005 },
      { x: 0.50, y: 0.88, r: 180, col: isDark ? 'rgba(45,142,245,0.045)': 'rgba(45,142,245,0.06)', dx: 0.00014, dy: -0.00009 },
    ]

    // ── Floating stars (3 depth layers) ───────────────────────────────────────
    // Layer 0: far/tiny — very slow drift, small, dim
    // Layer 1: mid — medium speed, medium size
    // Layer 2: near — faster drift, bigger, brighter
    const LAYER_CONFIGS = isDark
      ? [
          { count: 180, rMin: 0.3, rMax: 0.7,  speedX: 0.008, speedY: 0.005, alphaBase: 0.12, alphaAmp: 0.18, twinkleSpeed: 0.006 },
          { count: 90,  rMin: 0.7, rMax: 1.2,  speedX: 0.018, speedY: 0.012, alphaBase: 0.25, alphaAmp: 0.35, twinkleSpeed: 0.010 },
          { count: 35,  rMin: 1.2, rMax: 2.0,  speedX: 0.035, speedY: 0.022, alphaBase: 0.40, alphaAmp: 0.45, twinkleSpeed: 0.016 },
        ]
      : [
          { count: 70,  rMin: 0.3, rMax: 0.6,  speedX: 0.008, speedY: 0.005, alphaBase: 0.04, alphaAmp: 0.06, twinkleSpeed: 0.006 },
          { count: 35,  rMin: 0.6, rMax: 1.0,  speedX: 0.018, speedY: 0.012, alphaBase: 0.08, alphaAmp: 0.10, twinkleSpeed: 0.010 },
          { count: 14,  rMin: 1.0, rMax: 1.6,  speedX: 0.035, speedY: 0.022, alphaBase: 0.12, alphaAmp: 0.14, twinkleSpeed: 0.016 },
        ]

    const layers = LAYER_CONFIGS.map(cfg => ({
      cfg,
      stars: Array.from({ length: cfg.count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: cfg.rMin + Math.random() * (cfg.rMax - cfg.rMin),
        phase: Math.random() * Math.PI * 2,
        // drift direction — slow random walk feel
        dxDir: (Math.random() - 0.5),
        dyDir: (Math.random() - 0.5),
      }))
    }))

    // ── Shooting stars ────────────────────────────────────────────────────────
    const MAX_SHOOTERS = 4

    const spawnShooter = (stagger = false) => {
      const angle = (-(25 + Math.random() * 40)) * (Math.PI / 180)
      const speed = 7 + Math.random() * 10
      return {
        x: Math.random(),
        y: Math.random() * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 80 + Math.random() * 160,
        life: stagger ? -Math.floor(Math.random() * 260) : 0,
        maxLife: 50 + Math.random() * 45,
        flip: Math.random() < 0.22,
      }
    }

    const shooters = Array.from({ length: MAX_SHOOTERS }, () => spawnShooter(true))

    // ── Cross sparkles ────────────────────────────────────────────────────────
    const SPARKLE_COUNT = isDark ? 22 : 10
    const sparkles = Array.from({ length: SPARKLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 2.5 + Math.random() * 3.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.018 + Math.random() * 0.028,
      ttl: 100 + Math.floor(Math.random() * 240),
      age: Math.floor(Math.random() * 200),
    }))

    // ── Draw helpers ──────────────────────────────────────────────────────────
    const drawSparkle = (cx, cy, size, alpha) => {
      const col = isDark ? `rgba(140,190,255,${alpha})` : `rgba(45,142,245,${alpha})`
      ctx.save()
      ctx.strokeStyle = col
      ctx.lineWidth = 1.1
      ctx.beginPath()
      ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy)
      ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size)
      ctx.stroke()
      const d = size * 0.55
      ctx.lineWidth = 0.65
      ctx.beginPath()
      ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d)
      ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.14, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.fill()
      ctx.restore()
    }

    const drawShooter = (s, W, H) => {
      if (s.life < 0) return
      const progress = s.life / s.maxLife
      const fade = progress < 0.2
        ? progress / 0.2
        : 1 - (progress - 0.2) / 0.8
      if (fade <= 0) return

      const flip = s.flip ? -1 : 1
      const headX = s.x * W + s.vx * s.life * flip
      const headY = s.y * H + s.vy * s.life
      const tailFrac = Math.min(1, s.life / (s.maxLife * 0.45))
      const tailLen  = s.len * tailFrac
      const mag = Math.hypot(s.vx, s.vy)
      const nx = -s.vx * flip / mag
      const ny = -s.vy       / mag
      const tailX = headX + nx * tailLen
      const tailY = headY + ny * tailLen

      const maxAlpha = isDark ? 0.90 : 0.55
      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
      grad.addColorStop(0,   isDark ? 'rgba(140,190,255,0)' : 'rgba(45,142,245,0)')
      grad.addColorStop(0.55, isDark
        ? `rgba(160,205,255,${fade * maxAlpha * 0.4})`
        : `rgba(45,142,245,${fade * maxAlpha * 0.3})`)
      grad.addColorStop(1,   isDark
        ? `rgba(220,235,255,${fade * maxAlpha})`
        : `rgba(45,142,245,${fade * maxAlpha})`)

      ctx.save()
      ctx.lineWidth = isDark ? 1.6 : 1.2
      ctx.strokeStyle = grad
      ctx.shadowBlur  = isDark ? 8 : 4
      ctx.shadowColor = isDark ? 'rgba(140,190,255,0.5)' : 'rgba(45,142,245,0.35)'
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(headX, headY)
      ctx.stroke()
      ctx.restore()
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)

      // Background gradient (same as original)
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      if (isDark) {
        bg.addColorStop(0,   '#070e25')
        bg.addColorStop(0.5, '#0a1530')
        bg.addColorStop(1,   '#060c1e')
      } else {
        bg.addColorStop(0,   '#eaf4fb')
        bg.addColorStop(0.5, '#f0f7fb')
        bg.addColorStop(1,   '#e4f0f8')
      }
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Subtle grid
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.022)' : 'rgba(26,45,90,0.055)'
      ctx.lineWidth = 0.5
      const gs = 70
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      // Orbs
      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy
        if (o.x < -0.25 || o.x > 1.25) o.dx *= -1
        if (o.y < -0.25 || o.y > 1.25) o.dy *= -1
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r)
        g.addColorStop(0, o.col)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      })

      // ── Floating stars (depth layers) ────────────────────────────────────
      layers.forEach(({ cfg, stars }) => {
        stars.forEach(s => {
          // Slow continuous float using sinusoidal drift — feels organic/weightless
          const floatX = s.x * W + Math.sin(t * cfg.speedX * 0.8 + s.phase) * 38 * s.dxDir
          const floatY = s.y * H + Math.cos(t * cfg.speedY * 0.8 + s.phase * 1.3) * 24 * s.dyDir

          // Twinkle
          const a = cfg.alphaBase + cfg.alphaAmp * Math.sin(s.phase + t * cfg.twinkleSpeed)

          ctx.beginPath()
          ctx.arc(floatX, floatY, s.r, 0, Math.PI * 2)
          ctx.fillStyle = isDark
            ? `rgba(150,195,255,${a})`
            : `rgba(45,142,245,${a})`
          ctx.fill()
        })
      })

      // ── Shooting stars ───────────────────────────────────────────────────
      shooters.forEach((s, i) => {
        s.life++
        drawShooter(s, W, H)
        if (s.life > s.maxLife) {
          shooters[i] = spawnShooter()
          shooters[i].life = -Math.floor(80 + Math.random() * 200)
        }
      })

      // ── Cross sparkles ───────────────────────────────────────────────────
      sparkles.forEach((sp, i) => {
        sp.age++
        if (sp.age > sp.ttl) {
          sparkles[i] = {
            x: Math.random(), y: Math.random(),
            size: 2.5 + Math.random() * 3.5,
            phase: Math.random() * Math.PI * 2,
            speed: 0.018 + Math.random() * 0.028,
            ttl: 100 + Math.floor(Math.random() * 240),
            age: 0,
          }
          return
        }
        const prog = sp.age / sp.ttl
        const fade  = Math.sin(prog * Math.PI)
        const pulse = 0.5 + 0.5 * Math.sin(sp.phase + t * sp.speed)
        const alpha = fade * pulse * (isDark ? 0.80 : 0.42)
        if (alpha < 0.01) return
        drawSparkle(sp.x * W, sp.y * H, sp.size * (0.7 + 0.3 * pulse), alpha)
      })

      t++
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [isDark])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0,
      width: '100%', height: '100%',
      zIndex: -1, pointerEvents: 'none',
    }} />
  )
}