import { useState, useEffect } from "react";
import TestimonialsDashboard from "./testimonials_admin";

// ── Injected global styles ────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .adm-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    font-family: 'Sora', system-ui, sans-serif;
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;
  }

  /* ── Sidebar ───────────────────────────────────────────────── */
  .adm-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #051836;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    border-right: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
  }

  /* subtle grid lines matching login page */
  .adm-sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(64,7,219,0.025) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
  }

  /* glow blob top-right */
  .adm-sidebar::after {
    content: '';
    position: absolute;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(5,7,95,0.18) 0%, transparent 70%);
    top: -80px;
    right: -80px;
    pointer-events: none;
  }

  .adm-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 24px 20px 20px;
    position: relative;
    z-index: 1;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 8px;
  }
  .adm-logo-icon {
    width: 34px;
    height: 34px;
    background: #fff;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .adm-logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .adm-logo-brand {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.02em;
  }
  .adm-logo-tag {
    font-size: 9px;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .adm-nav {
    flex: 1;
    padding: 8px 12px;
    position: relative;
    z-index: 1;
    overflow-y: auto;
  }

  .adm-nav-section {
    margin-bottom: 24px;
  }
  .adm-nav-label {
    font-size: 9px;
    font-weight: 600;
    color: rgba(255,255,255,0.25);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .adm-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    color: rgba(255,255,255,0.45);
    font-size: 13px;
    font-weight: 400;
    user-select: none;
    position: relative;
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'Sora', sans-serif;
  }
  .adm-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.75);
  }
  .adm-nav-item.active {
    background: rgba(255,255,255,0.1);
    color: #fff;
    font-weight: 500;
  }
  .adm-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    background: #fff;
    border-radius: 0 3px 3px 0;
  }
  .adm-nav-icon {
    font-size: 16px;
    line-height: 1;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
    opacity: 0.7;
  }
  .adm-nav-item.active .adm-nav-icon { opacity: 1; }

  .adm-nav-badge {
    margin-left: auto;
    background: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.6);
    font-size: 9px;
    font-family: 'DM Mono', monospace;
    padding: 2px 6px;
    border-radius: 20px;
    font-weight: 500;
  }
  .adm-nav-item.active .adm-nav-badge {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  .adm-nav-coming {
    font-size: 8px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
    margin-left: auto;
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.3);
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .adm-sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    position: relative;
    z-index: 1;
  }
  .adm-logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 8px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    font-size: 12px;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
  }
  .adm-logout-btn:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    color: #fca5a5;
  }
  .adm-logout-year {
    margin-left: auto;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: rgba(255,255,255,0.15);
  }

  /* ── Main content ──────────────────────────────────────────── */
  .adm-main {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ── Top bar ───────────────────────────────────────────────── */
  .adm-topbar {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 28px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .adm-topbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-breadcrumb-sep {
    color: #d1d5db;
    font-size: 16px;
  }
  .adm-breadcrumb-root {
    font-size: 12px;
    color: #9ca3af;
    font-family: 'DM Mono', monospace;
  }
  .adm-breadcrumb-page {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }
  .adm-topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .adm-avatar {
    width: 30px;
    height: 30px;
    background: #051836;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
  }
  .adm-time {
    font-size: 11px;
    color: #9ca3af;
    font-family: 'DM Mono', monospace;
  }

  /* ── Page area ─────────────────────────────────────────────── */
  .adm-page {
    flex: 1;
    animation: fadeIn 0.2s ease both;
  }

  /* ── Placeholder panels ────────────────────────────────────── */
  .adm-placeholder {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    text-align: center;
  }
  .adm-placeholder-icon {
    width: 64px;
    height: 64px;
    background: #f3f4f6;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 16px;
  }
  .adm-placeholder-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 6px;
  }
  .adm-placeholder-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 300px;
    line-height: 1.6;
  }
  .adm-placeholder-pill {
    margin-top: 16px;
    background: #f3f4f6;
    border: 1px dashed #d1d5db;
    color: #6b7280;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    padding: 5px 14px;
    border-radius: 20px;
  }
`;

// ── Nav config ────────────────────────────────────────────────────
const NAV = [
  {
    section: "Manage",
    items: [
      { id: "testimonials", label: "Testimonials", icon: "⭐", badge: null },
      { id: "members",      label: "Members",      icon: "👤", badge: null,  soon: true },
      { id: "services",     label: "Services",     icon: "🛠️", badge: null,  soon: true },
    ],
  },
];

// ── Clock ─────────────────────────────────────────────────────────
function LiveTime() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })),
    30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="adm-time">{time}</span>;
}

// ── Placeholder panel ─────────────────────────────────────────────
function ComingSoon({ label, icon }) {
  return (
    <div className="adm-placeholder">
      <div className="adm-placeholder-icon">{icon}</div>
      <p className="adm-placeholder-title">{label}</p>
      <p className="adm-placeholder-sub">
        This section is under construction. Check back soon for full {label.toLowerCase()} management.
      </p>
      <span className="adm-placeholder-pill">coming soon</span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ active, onSelect }) {
  return (
    <aside className="adm-sidebar">
      {/* Logo */}
        <div className="adm-logo">
        <img
            src="/glow-logo.png"
            alt="NotionNik"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
        <div className="adm-logo-text">
            <span className="adm-logo-brand">NotionNik</span>
            <span className="adm-logo-tag">Admin Panel</span>
        </div>
        </div>

      {/* Nav */}
      <nav className="adm-nav" aria-label="Admin navigation">
        {NAV.map(group => (
          <div key={group.section} className="adm-nav-section">
            <p className="adm-nav-label">{group.section}</p>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`adm-nav-item${active === item.id ? " active" : ""}`}
                onClick={() => onSelect(item.id)}
                aria-current={active === item.id ? "page" : undefined}
              >
                <span className="adm-nav-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.badge != null && (
                  <span className="adm-nav-badge">{item.badge}</span>
                )}
                {item.soon && (
                  <span className="adm-nav-coming">soon</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="adm-sidebar-footer">
        <button
          className="adm-logout-btn"
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
        >
          <span>🚪</span>
          Sign out
          <span className="adm-logout-year">{new Date().getFullYear()}</span>
        </button>
      </div>
    </aside>
  );
}

// ── Page renderer ─────────────────────────────────────────────────
function PageContent({ active }) {
  switch (active) {
    case "testimonials":
      return <TestimonialsDashboard />;
    case "members":
      return <ComingSoon label="Members" icon="👤" />;
    case "services":
      return <ComingSoon label="Services" icon="🛠️" />;
    default:
      return null;
  }
}

// ── Page label lookup ─────────────────────────────────────────────
const PAGE_LABEL = {
  testimonials: "Testimonials",
  members:      "Members",
  services:     "Services",
};

// ── Main export ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active, setActive] = useState("testimonials");

  // Inject styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) window.location.href = "/admin/login";
  }, []);

  useEffect(() => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    window.location.replace("/admin/login");
  }
}, []);

  return (
    <div className="adm-root">
      <Sidebar active={active} onSelect={setActive} />

      <div className="adm-main">
        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <span className="adm-breadcrumb-root">admin</span>
            <span className="adm-breadcrumb-sep">/</span>
            <span className="adm-breadcrumb-page">{PAGE_LABEL[active]}</span>
          </div>
          <div className="adm-topbar-right">
            <LiveTime />
            <div className="adm-avatar" title="Admin">A</div>
          </div>
        </header>

        {/* Active page */}
        <main key={active} className="adm-page">
          <PageContent active={active} />
        </main>
      </div>
    </div>
  );
}