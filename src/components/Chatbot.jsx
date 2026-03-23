import { useState, useRef, useEffect } from 'react'

const API_BASE    = import.meta.env.VITE_API_URL || ""
const WEBHOOK_URL = `${API_BASE}/api/chat`
const API_KEY = "347a8e8a-e6fa-4870-9590-bffef8481545"

const BOT_RESPONSES = {
  default: "Hi! I'm NotionBot 🤖 I can help answer questions about our services. What would you like to know?",
}

// Parses **bold** markdown and returns an array of React nodes
function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function Chatbot({ forceOpen, onOpened }) {
  const [open,           setOpen]           = useState(false)
  const [msgs,           setMsgs]           = useState([{ from: 'bot', text: BOT_RESPONSES.default }])
  const [input,          setInput]          = useState('')
  const [typing,         setTyping]         = useState(false)
  const [unread,         setUnread]         = useState(1)
  const [conversationId, setConversationId] = useState(null)
  const [showSuggestions,setShowSuggestions]= useState(true)
  const bottomRef = useRef(null)

  // Allow external open
  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      setUnread(0)
      if (onOpened) onOpened()
    }
  }, [forceOpen])

  useEffect(() => {
    if (open) {
      setUnread(0)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, msgs])

  const send = async (overrideText) => {
    const txt = (overrideText ?? input).trim()
    if (!txt || typing) return

    setMsgs(m => [...m, { from: 'user', text: txt }])
    setInput('')
    setTyping(true)
    setShowSuggestions(false)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','x-api-key' : API_KEY },
        body: JSON.stringify({
          message:        txt,
          timestamp:      new Date().toISOString(),
          source:         'NotionNik Chatbot',
          conversationId: conversationId || '',
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()

      const convId = data.conversationID || data.conversationId
      if (convId) setConversationId(convId)

      const reply =
        data.response ||
        data.reply ||
        "Thanks for your message! Our team will get back to you shortly. You can also reach us on WhatsApp at +63 966 367 1854."

      setTimeout(() => {
        setTyping(false)
        setMsgs(m => [...m, { from: 'bot', text: reply }])
        if (!open) setUnread(n => n + 1)
      }, 800)

    } catch (error) {
      console.error('Chatbot error:', error)

      setTimeout(() => {
        setTyping(false)
        setMsgs(m => [...m, {
          from: 'bot',
          text: "I'm having trouble connecting right now. Please reach us directly on WhatsApp at +63 966 367 1854 or Instagram @notionnik.",
        }])
        if (!open) setUnread(n => n + 1)
      }, 1000)
    }
  }

  const QUICK_QUESTIONS = [
    'What services do you offer?',
    'How do I book a call?',
    'Tell me about automation'
  ]

  return (
    <>
      {/* Chat window */}
      <div className={`fixed bottom-24 right-5 md:right-8 z-50 w-[340px] max-w-[calc(100vw-2.5rem)]
        bg-navy-950 border border-white/10 rounded-2xl shadow-2xl
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
          <button
            onClick={() => setOpen(false)}
            className="ml-auto w-7 h-7 rounded-lg bg-navy-700 border border-white/10 flex items-center justify-center text-blue-200/50 hover:text-white text-xs transition-colors">
            ✕
          </button>
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
                {parseBold(m.text)}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && msgs.length === 1 && (
            <div className="space-y-2 pt-1">
              <p className="font-mono text-[9px] text-blue-300/40 tracking-widest text-center uppercase">
                Quick questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] font-mono font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full hover:bg-brand-500/20 transition-colors text-left">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-navy-700/80 border border-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
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
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white hover:bg-brand-400 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-7 right-5 md:right-8 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-navy-700 border border-brand-500/40 shadow-brand flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        {open ? '✕' : '💬'}

        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}