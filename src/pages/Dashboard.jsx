import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useTheme } from "./ThemeContext";

/* ── API Base ─────────────────────────────────────────────── */
const API_BASE =
  import.meta.env.VITE_API_URL || "https://notionnik-backend.onrender.com";

/* ── Image Proxy Helper ─────────────────────────────────────── */
function proxyImage(url) {
  if (!url) return null;
  if (!url.includes("notion") && !url.includes("amazonaws")) return url;
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

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

/* ── Reveal on scroll ──────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ── Animated counter ──────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (ts) => {
            const p = Math.min((ts - start) / 1800, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(ease * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ── Service popup ─────────────────────────────────────────── */
function ServiceModal({ service, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-navy-900 border border-brand-500/25 rounded-3xl shadow-brand-lg overflow-hidden">
        <div className="flex items-start justify-between p-7 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-2xl font-mono text-brand-400">
              {service.icon || "◈"}
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-xl">
                {service.title}
              </h2>
              <p className="text-brand-400/70 text-xs font-mono mt-0.5">
                {service.tagline || "Professional Service"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-navy-700 border border-white/10 flex items-center justify-center text-blue-200/50 hover:text-white text-sm transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-7 space-y-5">
          <p className="text-blue-100/75 leading-relaxed">
            {service.desc ||
              service.description ||
              "Professional service tailored to your workflow."}
          </p>
          {service.features && service.features.length > 0 && (
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-widest text-brand-400/70 uppercase mb-3">
                What's included
              </p>
              <div className="grid grid-cols-2 gap-2">
                {service.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2.5 bg-navy-800/50 rounded-xl px-3.5 py-2.5"
                  >
                    <div className="w-4 h-4 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                      <svg width="7" height="7" viewBox="0 0 12 10" fill="none">
                        <path
                          d="M1 5l3.5 3.5L11 1"
                          stroke="#2d8ef5"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="text-blue-100/70 text-xs">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(service.tools || []).map((t) => (
              <span
                key={t}
                className="font-mono text-[11px] text-blue-300/70 bg-navy-800/70 border border-white/[0.08] px-3 py-1.5 rounded-lg"
              >
                {t}
              </span>
            ))}
          </div>
          <Link to="/book" onClick={onClose}>
            <button className="btn-primary w-full justify-center text-sm py-3.5">
              <span>Book a Discovery Call →</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Contact form ──────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "https://hook.eu1.make.com/t1net90pz4vat28sxaura2tb1x2qq47v",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      if (!res.ok) throw new Error("Webhook failed");

      setSent(true);

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Form submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full bg-navy-800/60 border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder-blue-200/25 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 font-body`;

  if (sent)
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-2xl mx-auto mb-4">
          ✓
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">
          Message sent!
        </h3>
        <p className="text-blue-200/55 text-sm">We'll reply within 24 hours.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">
            Name *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">
            Email *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@email.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">
          Subject *
        </label>
        <input
          required
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder="Project inquiry / Automation help / Question"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] font-semibold tracking-widest text-blue-400/60 uppercase mb-2">
          Message *
        </label>
        <textarea
          required
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={4}
          placeholder="Tell us about your project or ask a question…"
          className={`${inputCls} resize-y min-h-[100px]`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3.5"
        style={{ opacity: loading ? 0.75 : 1 }}
      >
        <span>{loading ? "Sending…" : "Send Message"}</span>

        {!loading && (
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
    </form>
  );
}

const STATS = [
  { value: 200, suffix: "+", label: "Projects Completed" },
  { value: 100, suffix: "+", label: "Happy Clients" },
  { value: 95, suffix: "%", label: "Job Succes Rate" },
  { value: 4, suffix: "yr", label: "Experience" },
];

const PROCESS = [
  {
    step: "01",
    title: "Discovery",
    desc: "We deep-dive into your workflow, tools, and pain points.",
  },
  {
    step: "02",
    title: "Strategy",
    desc: "We design a custom automation roadmap with clear ROI.",
  },
  {
    step: "03",
    title: "Build",
    desc: "We engineer your system — fully tested and documented.",
  },
  {
    step: "04",
    title: "Handover",
    desc: "Full training, docs, and 30-day support.",
  },
];

// Helper to parse Notion service data
function parseService(page) {
  const props = page.properties || {};
  const title =
    props.Title?.title?.[0]?.plain_text ||
    props.title?.title?.[0]?.plain_text ||
    "Untitled";
  const desc =
    props["Service Description"]?.rich_text
      ?.map((r) => r.plain_text)
      .join("") ||
    props.description?.rich_text?.map((r) => r.plain_text).join("") ||
    "";
  const icon = page.icon?.emoji || "◈";
  const logoFile = props.Logo?.files?.[0] || props.logo?.files?.[0];
  const logo =
    logoFile?.type === "external"
      ? logoFile.external.url
      : logoFile?.file?.url || null;

  // Extract features if available
  const features =
    props.Features?.multi_select?.map((f) => f.name) ||
    props.features?.rich_text
      ?.map((r) => r.plain_text)
      .join("")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean) ||
    [];

  // Extract tools if available
  const tools =
    props.Tools?.multi_select?.map((t) => t.name) ||
    props.tools?.rich_text
      ?.map((r) => r.plain_text)
      .join("")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean) ||
    [];

  const tagline =
    props.Tagline?.rich_text?.[0]?.plain_text ||
    props.tagline?.rich_text?.[0]?.plain_text ||
    "Professional Service";

  return { title, desc, icon, logo, id: page.id, features, tools, tagline };
}

// Helper to determine service type for testimonials
function getServiceType(tools) {
  if (!tools || tools.length === 0) return null;

  const normalizedTools = tools.map((t) => t.toLowerCase());
  const isOnlyNotion =
    normalizedTools.length === 1 && normalizedTools[0] === "notion";

  if (isOnlyNotion) {
    return { label: "Notion Setup", isAutomation: false };
  }

  const automationKeywords = [
    "make",
    "make.com",
    "n8n",
    "apps script",
    "appscript",
    "zapier",
    "automation",
  ];
  const hasAutomation = normalizedTools.some((tool) =>
    automationKeywords.some((keyword) => tool.includes(keyword)),
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

export default function Dashboard() {
  useReveal();
  const [selectedService, setSelectedService] = useState(null);

  // Backend data states
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const { isDark } = useTheme();

  // Fetch services from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/notion-services`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((d) => {
        const parsedServices = (d.results || []).map(parseService);
        setServices(parsedServices.slice(0, 3)); // Preview first 3
      })
      .catch((err) => {
        console.error("Services fetch error:", err);
        setServices([]);
      })
      .finally(() => setServicesLoading(false));
  }, []);

  // Fetch testimonials from backend
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
          setTestimonials(res.data.slice(0, 3)); // Preview first 3
        } else {
          setTestimonials([]);
        }
      })
      .catch((err) => {
        console.error("Testimonials fetch error:", err);
        setTestimonials([]);
      })
      .finally(() => {
        setTestimonialsLoading(false);
      });
  }, []);

  const previewServices = services.slice(0, 3);
  const previewTestimonials = testimonials.slice(0, 3);

  return (
    <main>
      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-brand-500/[0.07] blur-[100px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-navy-600/30 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div
                className="pill mb-6 animate-fade-up"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="status-live" />
                Notion Automation Agency
              </div>
              <h1
                className="font-display font-extrabold leading-[1.03] tracking-tight mb-6 animate-fade-up"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                  animationDelay: "0.15s",
                }}
              >
                <span className="text-white">We Build Systems</span>
                <br />
                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-600 bg-clip-text text-transparent">
                  That Work
                  <br />
                  While You Sleep
                </span>
              </h1>
              <p
                className="text-blue-200/65 text-[1.05rem] leading-relaxed mb-8 max-w-[480px] animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                Notion workspaces, automation workflows, and AI integrations —
                engineered for founders who want clarity without chaos.
              </p>
              <div
                className="flex flex-wrap gap-3 mb-10 animate-fade-up"
                style={{ animationDelay: "0.35s" }}
              >
                <Link to="/book">
                  <button className="btn-primary">
                    <span>Book Free Discovery Call</span>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </Link>
                <Link to="/case-studies">
                  <button className="btn-ghost">View Case Studies</button>
                </Link>
              </div>
              <div
                className="flex items-center gap-3 animate-fade-up"
                style={{ animationDelay: "0.45s" }}
              >
                <div className="flex -space-x-2.5">
                  {["AC", "JR", "KL", "TS"].map((init, i) => (
                    <div
                      key={init}
                      className="w-8 h-8 rounded-full border-2 border-navy-900 bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ zIndex: 4 - i }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-200/55">
                  <span className="text-white font-semibold">30+ founders</span>{" "}
                  already automated
                </p>
              </div>
            </div>

            {/* Floating logo */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute w-[380px] h-[380px] rounded-full border border-brand-500/15 animate-spin-slow" />
              <div className="absolute w-[290px] h-[290px] rounded-full border border-brand-500/10" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-500/10 animate-[pulseRing_3s_ease-out_infinite]" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-500/10 animate-[pulseRing_3s_ease-out_1s_infinite]" />
              <div className="relative z-10 animate-float bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-brand">
                <Logo size={80} showText={false} theme={isDark} />
              </div>
              {[
                { angle: 0, label: "Notion", icon: "◈", delay: "0s" },
                { angle: 90, label: "Automation", icon: "⟳", delay: "0.5s" },
                { angle: 180, label: "AI Powered", icon: "⬡", delay: "1s" },
                { angle: 270, label: "Google WS", icon: "⌘", delay: "1.5s" },
              ].map(({ angle, label, icon, delay }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 160;
                return (
                  <div
                    key={label}
                    className="absolute flex items-center gap-2 bg-navy-800/90 backdrop-blur-sm border border-white/[0.08] rounded-xl px-3 py-2 animate-float-delayed shadow-card"
                    style={{
                      transform: `translate(${Math.round(Math.cos(rad) * r)}px, ${Math.round(Math.sin(rad) * r)}px)`,
                      animationDelay: delay,
                    }}
                  >
                    <span className="text-brand-400 text-sm font-mono">
                      {icon}
                    </span>
                    <span className="text-white text-xs font-semibold whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="py-14 border-y border-white/[0.05] bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center reveal">
                <div
                  className="font-display text-4xl md:text-5xl font-extrabold mb-2"
                  style={{
                    background: "linear-gradient(135deg,#fff,#5aabff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "#2d8ef5",
                    backgroundClip: "text",
                  }}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="font-mono text-[11px] tracking-widest uppercase text-blue-400/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW (from backend) ─────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="reveal">
              <p className="section-label">What We Do</p>
              <h2 className="section-title text-white">
                Our <span className="gradient-text-blue">Services</span>
              </h2>
              <p className="text-blue-200/55 text-sm mt-3 max-w-md">
                Click any service to see what's included.
              </p>
            </div>
            <Link to="/services" className="reveal">
              <button className="btn-ghost">View All Services →</button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicesLoading ? (
              // Skeleton loaders
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-glass p-7">
                  <div className="skeleton w-11 h-11 rounded-xl mb-5" />
                  <div className="skeleton h-4 w-3/5 rounded mb-3" />
                  <div className="skeleton h-3 w-full rounded mb-2" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              ))
            ) : previewServices.length > 0 ? (
              previewServices.map((s, i) => (
                <button
                  key={s.id || i}
                  onClick={() => setSelectedService(s)}
                  className="card-glass p-7 text-left group reveal"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-xl font-mono text-brand-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                    {s.logo ? (
                      <img
                        src={s.logo}
                        alt={s.title}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      s.icon || "◈"
                    )}
                  </div>
                  <h3 className="font-display font-bold text-white text-[1.03rem] mb-2 group-hover:text-brand-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-blue-200/55 text-sm leading-relaxed mb-4">
                    {s.desc ||
                      "Custom automation solution tailored to your workflow."}
                  </p>
                  <div className="flex items-center gap-1.5 text-brand-400 text-xs font-semibold">
                    <span>Learn more</span>
                    <svg
                      width="11"
                      height="11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-blue-200/50">
                No services available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 reveal">
            <p className="section-label justify-center">How It Works</p>
            <h2 className="section-title text-white">
              Our <span className="gradient-text-blue">Process</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {PROCESS.map((p, i) => (
              <div
                key={p.step}
                className="relative reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-[calc(100%-32px)] h-px bg-gradient-to-r from-brand-500/30 to-transparent z-10" />
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-navy-400 flex items-center justify-center font-mono text-xs font-bold text-white mb-5 relative z-20">
                  {p.step}
                </div>
                <h3 className="font-display font-bold text-white text-[1.05rem] mb-2">
                  {p.title}
                </h3>
                <p className="text-blue-200/55 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES PREVIEW ────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="reveal">
              <p className="section-label">Real Results</p>
              <h2 className="section-title text-white">
                Case <span className="gradient-text-blue">Studies</span>
              </h2>
              <p className="text-blue-200/55 text-sm mt-3 max-w-md">
                Click any project to read the full story.
              </p>
            </div>
            <Link to="/case-studies" className="reveal">
              <button className="btn-ghost">View All Case Studies →</button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Static case studies - replace with backend data when available */}
            {[
              {
                id: "1",
                icon: "◈",
                tag: "Notion",
                title: "Startup OS",
                desc: "Complete business management system",
                result: "15hrs saved/week",
              },
              {
                id: "2",
                icon: "⟳",
                tag: "Automation",
                title: "Lead Pipeline",
                desc: "Automated CRM workflow",
                result: "3x faster",
              },
              {
                id: "3",
                icon: "⬡",
                tag: "AI",
                title: "Content Engine",
                desc: "AI-powered content creation",
                result: "10x output",
              },
            ].map((cs, i) => (
              <Link
                key={cs.id}
                to={`/case-studies/${cs.id}`}
                className="card-glass p-7 flex flex-col gap-5 group reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/12 border border-brand-500/22 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {cs.icon}
                  </div>
                  <span className="tag">{cs.tag}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-[1.05rem] mb-2 group-hover:text-brand-300 transition-colors">
                    {cs.title}
                  </h3>
                  <p className="text-blue-200/55 text-sm leading-relaxed">
                    {cs.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-400/[0.07] border border-emerald-400/15 rounded-xl px-4 py-2.5">
                  <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-emerald-400/70">
                    RESULT
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {cs.result}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-brand-400 text-sm font-semibold mt-auto">
                  <span>Read Full Story</span>
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS PREVIEW (from backend) ─────────────────── */}
      <section className="py-20 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="reveal">
              <p className="section-label">What Clients Say</p>
              <h2 className="section-title text-white">
                Trusted by <span className="gradient-text-blue">Founders</span>
              </h2>
            </div>
            <Link to="/testimonials" className="reveal">
              <button className="btn-ghost">View All Reviews →</button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonialsLoading ? (
              // Skeleton loaders
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-glass p-7">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="w-3 h-3 rounded-full bg-blue-400/20"
                      />
                    ))}
                  </div>
                  <div className="skeleton h-3 w-full rounded mb-2" />
                  <div className="skeleton h-3 w-4/5 rounded mb-4" />
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div>
                      <div className="skeleton h-3 w-20 rounded mb-1" />
                      <div className="skeleton h-2 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : previewTestimonials.length > 0 ? (
              previewTestimonials.map((t, i) => {
                const serviceType = getServiceType(t.tools);
                const clientInfo = getClientInfoLine(t.clientRole, t.company);
                const initials = (t.displayName || "??")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={t.id || i}
                    className="card-glass p-7 reveal"
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <svg
                            key={j}
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="#f59e0b"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                          </svg>
                        ))}
                      </div>
                      {serviceType && (
                        <span className="tag text-[9px]">
                          {serviceType.label}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100/80 text-[14px] leading-relaxed mb-5">
                      {t.feedback}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        <Avatar
                          src={t.image}
                          initials={initials}
                          color={COLORS[i % COLORS.length]}
                        />
                      </div>
                      <div>
                        <p className="font-display font-bold text-white text-sm">
                          {t.displayName}
                        </p>
                        {clientInfo && (
                          <p className="text-blue-300/50 text-[11px]">
                            {clientInfo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-10 text-blue-200/50">
                No testimonials available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM (before Book CTA) ──────────────────────── */}
      <section className="py-24 border-y border-white/[0.05]" id="contact">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div className="reveal">
              <p className="section-label">Get In Touch</p>
              <h2 className="section-title text-white mb-4">
                Have a <span className="gradient-text-blue">question?</span>
              </h2>
              <p className="text-blue-200/60 leading-relaxed mb-8">
                Drop us a message and we'll get back to you within 24 hours. For
                faster responses, reach us on WhatsApp.
              </p>
              {/* Direct channels */}
              <div className="space-y-3">
                {[
                  {
                    icon: "💬",
                    label: "WhatsApp",
                    val: "+63 966 367 1854",
                    href: "https://wa.me/639663671854",
                  },
                  {
                    icon: "📸",
                    label: "Instagram",
                    val: "@notionnik",
                    href: "https://instagram.com/notionnik",
                  },
                  {
                    icon: "💼",
                    label: "LinkedIn",
                    val: "NotionNik",
                    href: "https://linkedin.com/company/103721418",
                  },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-navy-800/40 border border-white/[0.06] hover:border-brand-500/25 hover:bg-navy-800/70 transition-all group"
                  >
                    <span className="text-xl">{c.icon}</span>
                    <div className="flex-1">
                      <span className="font-mono text-[10px] text-blue-400/50 tracking-widest uppercase block">
                        {c.label}
                      </span>
                      <span className="text-blue-200/70 text-sm">{c.val}</span>
                    </div>
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                      className="text-blue-400/30 group-hover:text-brand-400 group-hover:translate-x-1 transition-all"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            {/* Right — form */}
            <div className="reveal" style={{ transitionDelay: "0.15s" }}>
              <div className="card-glass p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOK CTA ─────────────────────────────────────────────── */}
      <section className="py-16 pb-24">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="reveal relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-navy-800 to-navy-900 p-12 md:p-16 text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[300px] rounded-full bg-brand-500/10 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <p className="section-label justify-center mb-4">
                Ready to Start
              </p>
              <h2 className="section-title text-white mb-4">
                Let's automate
                <br />
                <span className="gradient-text-blue">
                  your entire business.
                </span>
              </h2>
              <p className="text-blue-200/60 text-base leading-relaxed max-w-md mx-auto mb-8">
                Book a free 30-minute discovery call. We'll map exactly where
                automation saves you time and money — zero obligation.
              </p>
              <Link to="/book">
                <button className="btn-primary text-base px-8 py-4">
                  <span>Book Free Consultation</span>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
