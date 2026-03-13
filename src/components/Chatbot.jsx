import { useState, useRef, useEffect } from 'react'

const BOT_RESPONSES = {
  default: "Hi! I'm NotionBot 🤖 I can help answer questions about our services. What would you like to know?",
  services: "We offer Notion workspace setups, workflow automation with n8n/Make, AI integrations, Google Workspace automation, and API connections. Which interests you most?",
  pricing: "Our pricing starts at $499 for starter packages and scales with project complexity. Book a free call for a custom quote tailored to your needs!",
  notion: "We build custom Notion databases, dashboards, and project management systems — perfectly structured for your team's workflow.",
  automation: "We automate repetitive tasks using n8n, Make (Integromat), and Zapier — connecting your tools so they work together seamlessly 24/7.",
  contact: "You can reach us on WhatsApp at +63 966 367 1854, Instagram @notionnik, or book a free discovery call through our Book page!",
  book: "Book your free 30-minute discovery call at our Book page! We'll map out how automation can save you 10+ hours a week. No pressure, just genuine advice.",
}

function getReply(msg) {
  const m = msg.toLowerCase()
  if (m.includes('service') || m.includes('offer') || m.includes('do you'))   return BOT_RESPONSES.services
  if (m.includes('price') || m.includes('cost') || m.includes('how much'))     return BOT_RESPONSES.pricing
  if (m.includes('notion'))                                                     return BOT_RESPONSES.notion
  if (m.includes('automat') || m.includes('workflow') || m.includes('integr')) return BOT_RESPONSES.automation
  if (m.includes('contact') || m.includes('email') || m.includes('reach'))     return BOT_RESPONSES.contact
  if (m.includes('book') || m.includes('call') || m.includes('consult'))       return BOT_RESPONSES.book
  return "Great question! Our team specializes in Notion and automation. Book a free call and we'll answer everything in detail — tailored to your specific needs."
}

export default function Chatbot() {
  const [open,    setOpen]    = useState(false)
  const [msgs,    setMsgs]    = useState([{ from: 'bot', text: BOT_RESPONSES.default }])
  const [input,   setInput]   = useState('')
  const [typing,  setTyping]  = useState(false)
  const [unread,  setUnread]  = useState(1)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) { setUnread(0); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  }, [open, msgs])

  const send = () => {
    const txt = input.trim()
    if (!txt) return
    setMsgs(m => [...m, { from: 'user', text: txt }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs(m => [...m, { from: 'bot', text: getReply(txt) }])
      if (!open) setUnread(n => n + 1)
    }, 900 + Math.random() * 600)
  }

  return (
    <>
      {/* Chat window */}
      <div className={`fixed bottom-24 right-5 md:right-8 z-50 w-[340px] max-w-[calc(100vw-2.5rem)]
        bg-navy-900 border border-white/10 rounded-2xl shadow-2xl
        transition-all duration-300 origin-bottom-right
        ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07] bg-navy-800/60 rounded-t-2xl">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="font-display font-bold text-sm text-white">NotionBot</p>
            <div className="flex items-center gap-1.5">
              <span className="status-live" />
              <span className="font-mono text-[10px] text-emerald-400">Online · Usually replies instantly</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto w-7 h-7 rounded-lg bg-navy-700 border border-white/10 flex items-center justify-center text-blue-200/50 hover:text-white text-xs transition-colors">✕</button>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto px-4 py-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${m.from === 'user'
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-navy-700/80 text-blue-100/90 border border-white/[0.07] rounded-bl-sm'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-navy-700/80 border border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {['Services', 'Pricing', 'Book a Call'].map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              className="text-[11px] font-mono font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full hover:bg-brand-500/20 transition-colors">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 bg-navy-800/60 border border-white/[0.08] rounded-xl p-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about our services…"
              className="flex-1 bg-transparent text-sm text-white placeholder-blue-200/30 outline-none px-1"
            />
            <button onClick={send} className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white hover:bg-brand-400 transition-colors flex-shrink-0">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-7 right-5 md:right-8 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-navy-700 border border-brand-500/40 shadow-brand flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-brand-lg"
      >
        {open
          ? <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          : <svg width="20" height="20" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        }
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-navy-950 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}
