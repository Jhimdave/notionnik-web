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

    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.007 + Math.random() * 0.013,
    }))

    // Light blue orbs for light mode, darker for dark mode
    const orbs = [
      { 
        x: 0.12, y: 0.20, r: 200, 
        col: isDark ? 'rgba(45,142,245,0.07)' : 'rgba(45,142,245,0.12)',  
        dx: 0.00011, dy: 0.00007 
      },
      { 
        x: 0.82, y: 0.65, r: 260, 
        col: isDark ? 'rgba(26,45,90,0.10)' : 'rgba(26,58,92,0.08)',     
        dx: -0.00009, dy: 0.00005 
      },
      { 
        x: 0.50, y: 0.88, r: 180, 
        col: isDark ? 'rgba(45,142,245,0.045)' : 'rgba(135,206,250,0.15)', 
        dx: 0.00014, dy: -0.00009 
      },
    ]

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)

      // Background gradient - soft light blues for light mode
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      if (isDark) {
        bg.addColorStop(0,   '#070e25')
        bg.addColorStop(0.5, '#0a1530')
        bg.addColorStop(1,   '#060c1e')
      } else {
        // Soft blue gradient matching the CSS
        bg.addColorStop(0,   '#e8f4f8')
        bg.addColorStop(0.5, '#f0f7fa')
        bg.addColorStop(1,   '#e0ecf4')
      }
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Grid - light blue for light mode
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.022)' : 'rgba(45,142,245,0.06)'
      ctx.lineWidth = 0.5
      const gs = 70
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

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

      // Stars - subtle blue dots for light mode
      stars.forEach(s => {
        const baseAlpha = isDark ? 0.18 : 0.08
        const a = baseAlpha + (isDark ? 0.55 : 0.25) * Math.sin(s.phase + t * s.speed)
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        // Light mode: use brand blue instead of white
        ctx.fillStyle = isDark ? `rgba(140,190,255,${a})` : `rgba(45,142,245,${a})`
        ctx.fill()
      })

      t++
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: -1, pointerEvents: 'none',
      }}
    />
  )
}