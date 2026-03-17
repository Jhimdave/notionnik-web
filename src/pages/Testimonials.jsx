import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const COLORS = [
  "#2d8ef5",
  "#1a5fc0",
  "#5aabff",
  "#2d8ef5",
  "#1a5fc0",
  "#5aabff",
  "#2d8ef5",
  "#1a5fc0",
];

const API_BASE =
  import.meta.env.VITE_API_URL || "https://notionnik-backend.onrender.com";

function proxyImage(url) {
  if (!url) return null;
  if (!url.includes("notion") && !url.includes("amazonaws")) return url;
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}`;
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
      <img
        src={proxied}
        alt={initials}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}
    >
      {initials}
    </div>
  );
}

// Helper to determine if it's "Notion Setup" or "Automation"
function getServiceType(tools) {
  if (!tools || tools.length === 0) return null;
  
  const normalizedTools = tools.map(t => t.toLowerCase());
  const isOnlyNotion = normalizedTools.length === 1 && normalizedTools[0] === "notion";
  
  if (isOnlyNotion) {
    return { label: "Notion Setup", isAutomation: false };
  }
  
  // Check if it contains automation tools (Make, n8n, Apps Script, Zapier, etc.)
  const automationKeywords = ["make", "make.com", "n8n", "apps script", "appscript", "zapier", "automation"];
  const hasAutomation = normalizedTools.some(tool => 
    automationKeywords.some(keyword => tool.includes(keyword))
  );
  
  if (hasAutomation || tools.length > 1) {
    return { label: "Automation", isAutomation: true };
  }
  
  return { label: tools[0], isAutomation: false };
}

// Helper to format client info line
function getClientInfoLine(role, company) {
  const hasRole = role && role.trim() !== "";
  const hasCompany = company && company.trim() !== "";
  
  if (hasRole && hasCompany) {
    return `${role}, ${company}`;
  } else if (hasRole) {
    return role;
  } else if (hasCompany) {
    return company;
  }
  return "";
}

function TestimonialCard({ t, i, onClick }) {
  const initials = (t.displayName || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const serviceType = getServiceType(t.tools);
  const clientInfo = getClientInfoLine(t.clientRole, t.company);

  return (
    <div
      className="card-glass p-7 flex flex-col gap-4 h-full cursor-pointer hover:border-brand-500/40 transition-all duration-200"
      onClick={() => onClick(t)}
    >
      <div className="flex items-start justify-between">
        <Stars n={t.rate} />
        {/* Service type badge */}
        {serviceType && (
          <span className="tag text-[9px]">
            {serviceType.label}
          </span>
        )}
      </div>
      <p className="text-blue-100/80 text-[14px] leading-relaxed flex-1">
        {t.feedback}
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
        <Avatar
          src={t.image}
          initials={initials}
          color={COLORS[i % COLORS.length]}
        />
        <div>
          <p className="font-display font-bold text-white text-sm">
            {t.displayName}
          </p>
          {clientInfo && (
            <p className="text-blue-300/50 text-[11px]">{clientInfo}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ t, onClose }) {
  const initials = (t.displayName || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const clientInfo = getClientInfoLine(t.clientRole, t.company);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-3xl bg-navy-900 border border-brand-500/20 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center text-white/60 hover:text-white transition"
        >
          ✕
        </button>

        {/* Header: Avatar, Name, Role, Company */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar 
            src={t.image} 
            initials={initials} 
            color={COLORS[0]} 
          />
          <div>
            <p className="font-display font-bold text-white text-lg">
              {t.displayName}
            </p>
            {clientInfo && (
              <p className="text-blue-300/60 text-sm">{clientInfo}</p>
            )}
          </div>
        </div>

        {/* Project Title */}
        {t.projectTitle && (
          <div className="mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400/55 mb-2">
              Project
            </p>
            <p className="text-white text-lg font-semibold">
              {t.projectTitle}
            </p>
          </div>
        )}

        {/* Raw Screenshot */}
        {t.rawScreenshot && (
          <div className="mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400/55 mb-2">
              Upwork Feedback
            </p>
            <img
              src={proxyImage(t.rawScreenshot)}
              alt="Feedback screenshot"
              className="w-full rounded-xl border border-white/[0.08] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Tools - Bordered bubbles */}
        {t.tools && t.tools.length > 0 && (
          <div className="mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400/55 mb-3">
              Tools Used
            </p>
            <div className="flex flex-wrap gap-2">
              {t.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 rounded-full text-sm text-blue-200 border border-blue-500/30 bg-blue-500/10"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Credibility Link */}
        {t.credibilityLink && (
          <a
            href={t.credibilityLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full btn-primary text-sm py-3 px-6 rounded-xl mt-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`)
      .then(async (r) => {
        const text = await r.text();
        try {
          const json = JSON.parse(text);
          return json;
        } catch (err) {
          return null;
        }
      })
      .then((res) => {
        if (res?.success) {
          setTestimonials(res.data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    timerRef.current = setInterval(
      () => setActive((a) => (a + 1) % testimonials.length),
      4500,
    );
    return () => clearInterval(timerRef.current);
  }, [testimonials]);

  const featured = testimonials[active];

  // Helper for featured card service type
  const getFeaturedServiceType = (tools) => {
    const type = getServiceType(tools);
    return type ? type.label : null;
  };

  return (
    <main className="pt-24">
      {/* Modal */}
      {modal && <Modal t={modal} onClose={() => setModal(null)} />}

      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Social Proof</p>
          <h1 className="section-title text-white mb-4">
            What Clients <span className="gradient-text-blue">Say</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            Don't take our word for it. Hear from the founders and teams we've
            helped automate their way to freedom.
          </p>
        </div>
      </section>

      {/* Featured carousel */}
      {!loading && featured && (
        <section className="py-16 bg-navy-900/30 border-b border-white/[0.05]">
          <div className="max-w-4xl mx-auto px-5 md:px-8">
            <div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 border border-brand-500/20 p-10 md:p-14 cursor-pointer hover:border-brand-500/40 transition-all"
              onClick={() => setModal(featured)}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-500/8 blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Stars n={featured.rate} />
                  {(() => {
                    const serviceLabel = getFeaturedServiceType(featured.tools);
                    return serviceLabel ? (
                      <span className="tag">{serviceLabel}</span>
                    ) : null;
                  })()}
                </div>
                <p className="font-display text-xl md:text-2xl text-white leading-relaxed mb-8 font-semibold">
                  {featured.feedback}
                </p>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={featured.image}
                    initials={(featured.displayName || "??")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                    color={COLORS[active % COLORS.length]}
                  />
                  <div>
                    <p className="font-display font-bold text-white">
                      {featured.displayName}
                    </p>
                    {(() => {
                      const info = getClientInfoLine(featured.clientRole, featured.company);
                      return info ? (
                        <p className="text-blue-300/60 text-sm">{info}</p>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(i);
                        clearInterval(timerRef.current);
                      }}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === active ? 28 : 8,
                        height: 8,
                        background:
                          i === active ? "#2d8ef5" : "rgba(45,142,245,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All testimonials grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <h2 className="section-title text-white mb-10 text-2xl">
            All Reviews
          </h2>
          {loading ? (
            <div className="text-blue-300/50 text-center py-20">
              Loading testimonials...
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {testimonials.map((t, i) => (
                <div key={t.id} className="break-inside-avoid">
                  <TestimonialCard t={t} i={i} onClick={setModal} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "5.0", label: "Average Rating", suffix: "" },
              { val: "100+", label: "Happy Clients", suffix: "" },
              { val: "200+", label: "Projects Done", suffix: "" },
              { val: "100%", label: "Would Recommend", suffix: "" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-extrabold stat-number mb-1">
                  {s.val}
                  <span className="text-2xl text-blue-300/50">{s.suffix}</span>
                </div>
                <p className="font-mono text-[11px] tracking-widest uppercase text-blue-400/55">
                  {s.label}
                </p>
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
            Book a free discovery call and let's build something you'll rave
            about too.
          </p>
          <Link to="/book">
            <button className="btn-primary text-base px-8 py-4">
              <span>Book Free Call →</span>
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}