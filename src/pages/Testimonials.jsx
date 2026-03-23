import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const COLORS = [
  "#2d8ef5","#1a5fc0","#5aabff","#2d8ef5",
  "#1a5fc0","#5aabff","#2d8ef5","#1a5fc0",
];

const API_BASE =
  import.meta.env.VITE_API_URL || "https://notionnik-backend.onrender.com";
const API_KEY = "347a8e8a-e6fa-4870-9590-bffef8481545";
const PAGE_SIZE   = 6;

function proxyImage(url) {
  if (!url) return null;
  if (!url.includes("notion") && !url.includes("amazonaws")) return url;
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}&api_key=${API_KEY}`;
}

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: Math.round(n) }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ src, initials, color }) {
  const [failed, setFailed] = useState(false);
  const proxied = proxyImage(src);
  if (proxied && !failed) {
    return (
      <img src={proxied} alt={initials}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
      {initials}
    </div>
  );
}

function getServiceType(tools) {
  if (!tools || tools.length === 0) return null;
  const n = tools.map(t => t.toLowerCase());
  if (n.length === 1 && n[0] === "notion") return { label: "Notion Setup", isAutomation: false };
  const kw = ["make","make.com","n8n","apps script","appscript","zapier","automation"];
  if (n.some(t => kw.some(k => t.includes(k))) || tools.length > 1) return { label: "Automation", isAutomation: true };
  return { label: tools[0], isAutomation: false };
}

function getClientInfoLine(role, company) {
  const r = role?.trim(), c = company?.trim();
  if (r && c) return `${r}, ${c}`;
  return r || c || "";
}

/* ── Testimonial Card — full feedback, View more bottom right ─── */
function TestimonialCard({ t, i, onClick }) {
  const initials    = (t.displayName || "??").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const serviceType = getServiceType(t.tools);
  const clientInfo  = getClientInfoLine(t.clientRole, t.company);

  return (
    <div
      className="card-glass p-6 flex flex-col gap-3 cursor-pointer hover:border-brand-500/40 transition-all duration-200 h-full"
      onClick={() => onClick(t)}
    >
      {/* Top: stars + tag */}
      <div className="flex items-start justify-between flex-shrink-0">
        <Stars n={t.rate} />
        {serviceType && <span className="tag text-[9px]">{serviceType.label}</span>}
      </div>

      {/* Feedback — full text displayed */}
      <div className="flex-1">
        <p className="text-blue-100/80 text-[13px] leading-relaxed">
          {t.feedback}
        </p>
      </div>

      {/* Footer: client details (left) + View more (right) */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] flex-shrink-0 mt-auto gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={t.image} initials={initials} color={COLORS[i % COLORS.length]} />
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm truncate">{t.displayName}</p>
            {clientInfo && <p className="text-blue-300/50 text-[11px] truncate">{clientInfo}</p>}
          </div>
        </div>
        <span className="text-brand-400 text-xs font-medium underline underline-offset-2 flex-shrink-0">
          View more...
        </span>
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────── */
function Modal({ t, onClose, isDark }) {
  const initials   = (t.displayName || "??").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const clientInfo = getClientInfoLine(t.clientRole, t.company);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const modalBg      = isDark ? "rgba(7,14,37,0.97)"      : "rgba(255,255,255,0.97)";
  const modalBorder  = isDark ? "rgba(45,142,245,0.20)"   : "rgba(84,131,179,0.22)";
  const headingColor = isDark ? "#f0f6ff"                 : "#021024";
  const bodyColor    = isDark ? "rgba(186,220,255,0.82)"  : "rgba(5,38,89,0.72)";
  const mutedColor   = isDark ? "rgba(125,160,202,0.60)"  : "rgba(84,131,179,0.70)";
  const labelColor   = isDark ? "rgba(84,131,179,0.65)"   : "rgba(84,131,179,0.80)";
  const closeBg      = isDark ? "rgba(255,255,255,0.07)"  : "rgba(5,38,89,0.07)";
  const closeHoverBg = isDark ? "rgba(255,255,255,0.14)"  : "rgba(5,38,89,0.12)";
  const closeColor   = isDark ? "rgba(255,255,255,0.60)"  : "rgba(5,38,89,0.55)";
  const toolBg       = isDark ? "rgba(45,142,245,0.10)"   : "rgba(84,131,179,0.10)";
  const toolBorder   = isDark ? "rgba(45,142,245,0.25)"   : "rgba(84,131,179,0.28)";
  const toolColor    = isDark ? "rgba(186,220,255,0.85)"  : "#052659";
  const imgBorder    = isDark ? "rgba(255,255,255,0.08)"  : "rgba(84,131,179,0.15)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)"  : "rgba(84,131,179,0.12)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="absolute inset-0"
        style={{ background: isDark ? "rgba(0,0,0,0.70)" : "rgba(2,16,36,0.38)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div style={{
        position: "relative", width: "100%", maxWidth: "680px",
        background: modalBg,
        border: `1px solid ${modalBorder}`,
        borderRadius: "24px",
        padding: "32px",
        boxShadow: isDark
          ? "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(193,232,255,0.05) inset"
          : "0 32px 80px rgba(2,16,36,0.18), 0 0 0 1px rgba(255,255,255,0.8) inset",
        overflowY: "auto",
        maxHeight: "90vh",
        backdropFilter: "blur(20px)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          width: "32px", height: "32px", borderRadius: "50%",
          background: closeBg, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: closeColor, fontSize: "13px", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = closeHoverBg; e.currentTarget.style.color = headingColor; }}
          onMouseLeave={e => { e.currentTarget.style.background = closeBg; e.currentTarget.style.color = closeColor; }}
        >✕</button>

        <div className="mb-5"><Stars n={t.rate} /></div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
          <Avatar src={t.image} initials={initials} color={COLORS[0]} />
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "17px", color: headingColor, margin: 0, lineHeight: 1.2 }}>
              {t.displayName}
            </p>
            {clientInfo && (
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px", color: mutedColor, margin: "3px 0 0" }}>
                {clientInfo}
              </p>
            )}
          </div>
        </div>

        {t.feedback && (
          <div style={{ marginBottom: "22px" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "15px", lineHeight: 1.75, color: bodyColor, margin: 0 }}>
              {t.feedback}
            </p>
          </div>
        )}

        <div style={{ height: "1px", background: dividerColor, margin: "22px 0" }} />

        {t.projectTitle && (
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: labelColor, marginBottom: "6px" }}>
              Project
            </p>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "15px", color: headingColor, margin: 0 }}>
              {t.projectTitle}
            </p>
          </div>
        )}

        {t.rawScreenshot && (
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: labelColor, marginBottom: "8px" }}>
              Upwork Feedback
            </p>
            <img src={proxyImage(t.rawScreenshot)} alt="Feedback screenshot"
              style={{ width: "100%", borderRadius: "12px", border: `1px solid ${imgBorder}`, display: "block" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        )}

        {t.tools && t.tools.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: labelColor, marginBottom: "10px" }}>
              Tools Used
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {t.tools.map(tool => (
                <span key={tool} style={{
                  padding: "5px 13px", borderRadius: "999px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                  color: toolColor, background: toolBg, border: `1px solid ${toolBorder}`,
                }}>{tool}</span>
              ))}
            </div>
          </div>
        )}

        {t.credibilityLink && (
          <a href={t.credibilityLink} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", padding: "12px 24px", marginTop: "8px",
              background: "linear-gradient(135deg,#052659,#021024)",
              color: "#C1E8FF", borderRadius: "12px", border: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "14px",
              textDecoration: "none", cursor: "pointer",
              boxShadow: isDark ? "0 6px 20px rgba(2,16,36,0.50)" : "0 6px 20px rgba(5,38,89,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#5483B3,#052659)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#052659,#021024)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View on Upwork
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Shuffle utility ─────────────────────────────────────────── */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/* ── 3-Row Responsive Carousel (1 mobile, 2 tablet, 3 desktop) ─ */
function ReviewsCarousel({ testimonials, onOpen }) {
  // Randomize testimonials
  // const shuffled = shuffleArray(testimonials);
  
  // Split into 3 rows (will show/hide via CSS)
  const rows = [[], [], []];
  testimonials.forEach((t, i) => {
    rows[i % 2].push(t);
  });

  // Duplicate for seamless scroll
  rows.forEach((row, idx) => {
    if (row.length > 0) {
      rows[idx] = [...row, ...row];
    }
  });

  const carouselStyles = `
    @keyframes scrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }
    @keyframes scrollRight {
      0% { transform: translateX(-33.333%); }
      100% { transform: translateX(0); }
    }
    .carousel-row {
      display: flex;
      gap: 1.25rem;
      width: fit-content;
    }
    .carousel-row-left {
      animation: scrollLeft 50s linear infinite;
    }
    .carousel-row-right {
      animation: scrollRight 50s linear infinite;
    }
    .carousel-row:hover {
      animation-play-state: paused;
    }
    .carousel-card {
      width: 400px;
      height : 370px;
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .carousel-card {
        width: 300px;
      }
    }
    .mask-fade-container {
      mask-image: linear-gradient(to right, 
        transparent 0%, 
        rgba(0,0,0,0.1) 5%, 
        rgba(0,0,0,1) 15%, 
        rgba(0,0,0,1) 85%, 
        rgba(0,0,0,0.1) 95%, 
        transparent 100%
      );
      -webkit-mask-image: linear-gradient(to right, 
        transparent 0%, 
        rgba(0,0,0,0.1) 5%, 
        rgba(0,0,0,1) 15%, 
        rgba(0,0,0,1) 85%, 
        rgba(0,0,0,0.1) 95%, 
        transparent 100%
      );
    }
  `;

  return (
    <div className="relative w-full md:w-[70%] mx-auto px-4">
      <style>{carouselStyles}</style>
      
      <div className="mask-fade-container flex flex-col gap-5 py-4 overflow-hidden">
        {/* Row 1 - always visible */}
        <div className="overflow-hidden">
          <div className="carousel-row carousel-row-left">
            {rows[0].map((t, i) => (
              <div key={`r1-${t.id}-${i}`} className="carousel-card">
                <TestimonialCard t={t} i={i} onClick={onOpen} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - hidden on mobile, visible on md+ */}
        <div className="overflow-hidden hidden md:block">
          <div className="carousel-row carousel-row-right">
            {rows[1].map((t, i) => (
              <div key={`r2-${t.id}-${i}`} className="carousel-card">
                <TestimonialCard t={t} i={i} onClick={onOpen} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - hidden on tablet/mobile, visible on lg+ */}
        <div className="overflow-hidden hidden lg:block">
          <div className="carousel-row carousel-row-left" style={{ animationDuration: '45s' }}>
            {rows[2].map((t, i) => (
              <div key={`r3-${t.id}-${i}`} className="carousel-card">
                <TestimonialCard t={t} i={i} onClick={onOpen} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Testimonials() {
  const { isDark } = useTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [active,       setActive]       = useState(0);
  const [modal,        setModal]        = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`,{
      headers:{
        "x-api-key":API_KEY,
      },
    })
      .then(async r => {
        const text = await r.text();
        try { return JSON.parse(text); } catch { return null; }
      })
      .then(res => { if (res?.success) setTestimonials(res.data); })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    timerRef.current = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [testimonials]);

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const featured = testimonials[active];

  return (
    <main className="pt-24">
      {modal && <Modal t={modal} isDark={isDark} onClose={() => setModal(null)} />}

      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Social Proof</p>
          <h1 className="section-title text-white mb-4">
            What Clients <span className="gradient-text-blue">Say</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Don't take our word for it. Hear from the founders and teams we've helped automate their way to freedom.
          </p>
        </div>
      </section>

      {/* Featured carousel */}
      {!loading && featured && (
        <section className="py-16 bg-navy-900/30 border-b border-white/[0.05]">
          <div className="max-w-4xl mx-auto px-5 md:px-8">
            <div
              className={`relative overflow-hidden rounded-3xl border border-brand-500/20 p-10 md:p-14 cursor-pointer hover:border-brand-500/40 transition-all ${isDark ? 'bg-gradient-to-br from-navy-800 to-navy-900' : 'bg-gradient-to-br from-blue-50 to-sky-100'}`}
              onClick={() => setModal(featured)}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-500/8 blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Stars n={featured.rate} />
                  {(() => {
                    const t = getServiceType(featured.tools);
                    return t ? <span className="tag">{t.label}</span> : null;
                  })()}
                </div>
                <p className="font-display text-xl md:text-2xl text-white leading-relaxed mb-8 font-semibold">
                  {featured.feedback}
                </p>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={featured.image}
                    initials={(featured.displayName || "??").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    color={COLORS[active % COLORS.length]}
                  />
                  <div>
                    <p className="font-display font-bold text-white">{featured.displayName}</p>
                    {(() => {
                      const info = getClientInfoLine(featured.clientRole, featured.company);
                      return info ? <p className="text-blue-300/60 text-sm">{info}</p> : null;
                    })()}
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button key={i}
                      onClick={e => { e.stopPropagation(); setActive(i); clearInterval(timerRef.current); }}
                      className="transition-all duration-300 rounded-full"
                      style={{ width: i === active ? 28 : 8, height: 8, background: i === active ? "#2d8ef5" : "rgba(45,142,245,0.2)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All reviews — 70% width, randomized, responsive rows */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8 mb-10">
          <h2 className="section-title text-white text-2xl">All Reviews</h2>
        </div>
        {loading ? (
          <div className="text-blue-300/50 text-center py-20">Loading testimonials...</div>
        ) : (
          <ReviewsCarousel testimonials={testimonials} onOpen={setModal} />
        )}
      </section>

      {/* Stats */}
      <section className="py-14 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "5.0",  label: "Average Rating"  },
              { val: "100+", label: "Happy Clients"   },
              { val: "200+", label: "Projects Done"   },
              { val: "100%", label: "Would Recommend" },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display text-4xl font-extrabold stat-number mb-1">{s.val}</div>
                <p className="font-mono text-[11px] tracking-widest uppercase text-blue-400/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
          <h2 className="section-title text-white mb-4">Ready to join them?</h2>
          <p className="text-blue-200/55 text-base mb-8 max-w-md mx-auto">
            Book a free discovery call and let's build something you'll rave about too.
          </p>
          <Link to="/book">
            <button className="btn-primary text-base px-8 py-4"><span>Book Free Call →</span></button>
          </Link>
        </div>
      </section>
    </main>
  );
}