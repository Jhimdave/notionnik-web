import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = -200, my = -200, rx = -200, ry = -200, raf

    const move = e => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', move)

    const tick = () => {
      // Dot centered on cursor (4px is half of 8px width/height)
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      // Ring centered on cursor (18px is half of 36px width/height)
      rx += (mx - rx) * 0.25
      ry += (my - ry) * 0.25
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onEnter = () => { ring.classList.add('hov'); dot.classList.add('hov') }
    const onLeave = () => { ring.classList.remove('hov'); dot.classList.remove('hov') }

    const obs = new MutationObserver(() => {
      document.querySelectorAll('a,button,[role=button],input,textarea,select,[data-cursor-hover]').forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    })
    obs.observe(document.body, { childList: true, subtree: true })
    document.querySelectorAll('a,button,[role=button],input,textarea,select,[data-cursor-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const onDown = () => dot.classList.add('pressed')
    const onUp   = () => dot.classList.remove('pressed')
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        @media (pointer: coarse) { .nn-dot, .nn-ring { display: none !important; } }
        .nn-dot {
          position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none;
          width: 8px; height: 8px; border-radius: 50%;
          background: #2d8ef5;
          transition: width 0.2s, height 0.2s, background 0.2s;
          will-change: transform;
        }
        .nn-dot.hov { width: 4px; height: 4px; background: #fff; }
        .nn-dot.pressed { width: 12px; height: 12px; }
        .nn-ring {
          position: fixed; top: 0; left: 0; z-index: 99998; pointer-events: none;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid rgba(45,142,245,0.55);
          transition: width 0.22s, height 0.22s, border-color 0.22s, background 0.22s;
          will-change: transform;
        }
        .nn-ring.hov {
          width: 52px; height: 52px;
          border-color: rgba(90,171,255,0.75);
          background: rgba(45,142,245,0.07);
        }
      `}</style>
      <div ref={dotRef}  className="nn-dot" />
      <div ref={ringRef} className="nn-ring" />
    </>
  )
}