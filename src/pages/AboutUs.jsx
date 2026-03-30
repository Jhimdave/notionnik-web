import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const API_BASE = import.meta.env.VITE_API_URL || "";
const NOTION_PROXY_URL = `${API_BASE}/api/notion-team`;
const API_KEY = import.meta.env.VITE_API_SECRET;

/* ── Cache config ──────────────────────────────────────────────────
   Key  : used to read/write from localStorage
   TTL  : how long cached data is considered fresh (1 hour = 3600000ms)
   ─────────────────────────────────────────────────────────────── */
const CACHE_KEY = "notionnik_team_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

/* ── Cache helpers ─────────────────────────────────────────────── */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    // Return null if older than TTL — forces a fresh fetch
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

const SEEDS = ["Alex","Jordan","Morgan","Taylor","Sam","Casey","Riley","Drew"];
const COLORS = ["b6e3f4","c0aede","d1f4d1","ffd5dc","ffdfbf","c1e1c5","d4c5f9","f4d1b6"];

function getAvatar(name, i) {
  const seed = encodeURIComponent(name || SEEDS[i % SEEDS.length]);
  const color = COLORS[i % COLORS.length];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${color}`;
}

function parseMember(page) {
  return {
    name: page.name || "Unknown",
    role: page.role || "",
    description: page.description || "",
    image: page.image || null,
    skills: Array.isArray(page.skills)
      ? page.skills
      : typeof page.skills === "string"
      ? page.skills.split("|").map(s => s.trim()).filter(Boolean)
      : [],
  };
}

const VALUES = [
  { icon:"⚡", title:"Speed",       desc:"We build fast and deploy even faster. Your systems go live without the long wait." },
  { icon:"🎯", title:"Precision",   desc:"Every automation is tested, documented, and built to work exactly as designed." },
  { icon:"🔒", title:"Reliability", desc:"We design for uptime. Your workflows run 24/7 without breaking or needing babysitting." },
  { icon:"🤝", title:"Partnership", desc:"We stay with you as your systems grow — not just for the build, but for the long run." },
];

const TABS = ["About", "Skills"];

export default function AboutUs() {
  const { isDark } = useTheme();
  const [team,      setTeam]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [activeTab, setActiveTab] = useState("About");

  useEffect(() => {
    async function fetchTeam() {
      /* ── 1. Try localStorage first ──────────────────────────────
         If cached data exists and is within TTL, use it immediately
         and skip the network request entirely.
         ────────────────────────────────────────────────────────── */
      const cached = readCache();
      if (cached) {
        setTeam(cached);
        setLoading(false);
        return; // ← no backend call, done
      }

      /* ── 2. No valid cache — fetch from backend ──────────────────
         This only runs on:
           • First ever visit (no cache yet)
           • After TTL expires (1 hour)
           • After a hard refresh that clears localStorage
         ────────────────────────────────────────────────────────── */
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(NOTION_PROXY_URL, {
          headers: { "x-api-key": API_KEY },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        const members = (data.results || []).map((p, i) => {
          const parsed = parseMember(p);
          return { ...parsed, img: parsed.image || getAvatar(parsed.name, i) };
        });

        members.sort((a, b) => {
          const aL = /leader/i.test(a.role);
          const bL = /leader/i.test(b.role);
          return aL && !bL ? -1 : !aL && bL ? 1 : 0;
        });

        setTeam(members);

        /* ── 3. Write fresh data into localStorage ──────────────────
           Next time this component mounts (page switch, navigation),
           readCache() will find this and return it without any fetch.
           ────────────────────────────────────────────────────────── */
        writeCache(members);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []); // runs once per component mount

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  function openModal(m) {
    setSelected(m);
    setActiveTab("About");
  }

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Who We Are</p>
          <h1 className="section-title text-white mb-4">
            About <span className="gradient-text-blue">NotionNik</span>
          </h1>
          <p className="text-blue-200/60 text-base max-w-lg leading-relaxed">
            A team of automation specialists, Notion builders, and systems thinkers dedicated to helping businesses eliminate repetitive work and operate at a higher level.
          </p>
        </div>
      </section>

      {/* Mission / Approach */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { n:"01", title:"Our Mission",  body:"To eliminate manual, repetitive work from every business we touch. Your time is too valuable to spend on tasks a well-built system can handle automatically. We engineer those systems so you can focus on growth — not grinding." },
              { n:"02", title:"Our Approach", body:"We start by deeply understanding your workflow, then design a custom automation strategy using the right tools for your needs — Notion, n8n, Make, Google Apps, or AI. Every solution is built to scale as your business grows." },
            ].map(s => (
              <div key={s.n} className="card-glass p-9">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-4xl font-bold text-brand-500/25">{s.n}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-brand-500/30 to-transparent"/>
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">{s.title}</h2>
                <p className="text-blue-200/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-navy-900/30 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">Our Values</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title}
                className="p-6 rounded-2xl bg-navy-800/50 border border-white/[0.06] hover:border-brand-500/25 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-500/12 border border-brand-500/20 flex items-center justify-center text-xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-white mb-2">{v.title}</h3>
                <p className="text-blue-200/55 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <p className="section-label">The Team</p>
          <h2 className="section-title text-white mb-2 text-3xl">
            The people behind <span className="gradient-text-blue">the systems</span>
          </h2>
          <p className="text-blue-200/55 text-base mb-12">Meet the specialists who build your automation stack.</p>

          {error && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              Could not load team from Notion. ({error})
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading && !error && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-glass p-7">
                <div className="skeleton w-16 h-16 rounded-full mx-auto mb-5"/>
                <div className="skeleton h-4 w-3/5 rounded mx-auto mb-2"/>
                <div className="skeleton h-3 w-2/5 rounded mx-auto"/>
              </div>
            ))}

            {!loading && team.map((m, i) => (
              <div key={m.name + i} onClick={() => openModal(m)}
                className="card-glass p-8 text-center flex flex-col items-center cursor-pointer hover:border-brand-500/40 hover:scale-[1.02] transition-all duration-300"
                style={{ height: 370 }}>
                <div className="rounded-full overflow-hidden border-2 border-brand-500/30 mb-8 flex-shrink-0" style={{ width:180, height:180 }}>
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" loading="lazy"/>
                </div>
                <h3 className="font-display text-[18px] font-bold text-white mb-2 flex-shrink-0">{m.name}</h3>
                <span className="tag text-[12px] mb-3 inline-block flex-shrink-0">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ backgroundColor:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)" }}
          onClick={() => setSelected(null)}>
          <div className="card-glass w-full max-w-md relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 text-blue-300/40 hover:text-white transition-colors duration-200 text-lg leading-none">✕</button>

            <div className="flex flex-col items-center text-center px-8 pt-8 pb-5">
              <div className="rounded-full overflow-hidden border-2 border-brand-500/30 mb-4" style={{ width:100, height:100 }}>
                <img src={selected.img} alt={selected.name} className="w-full h-full object-cover"/>
              </div>
              <h3 className="font-display font-bold text-white text-xl mb-1">{selected.name}</h3>
              <span className="tag text-[9px] inline-block">{selected.role}</span>
            </div>

            <div className="flex border-b border-white/[0.07] mx-8">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                    activeTab === tab ? "border-brand-500 text-brand-400" : "border-transparent text-blue-300/40 hover:text-blue-200/70"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="px-8 py-6 min-h-[140px]">
              {activeTab === "About" && (
                <p className="text-blue-300/80 text-sm italic leading-7 text-center">
                  {selected.description
                    ? <>&ldquo; {selected.description} &rdquo;</>
                    : <span className="not-italic text-blue-300/40">No bio available.</span>
                  }
                </p>
              )}
              {activeTab === "Skills" && (
                <div>
                  {selected.skills && selected.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 border border-brand-500/20 text-brand-300 tracking-wide">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-blue-300/40 text-sm text-center">No skills listed yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="card-glass p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-white mb-2">Ready to work together?</h3>
              <p className="text-blue-200/55">Book a free call and let's talk about what we can build.</p>
            </div>
            <Link to="/book">
              <button className="btn-primary px-8 py-4 text-base flex-shrink-0"><span>Book Free Call →</span></button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}