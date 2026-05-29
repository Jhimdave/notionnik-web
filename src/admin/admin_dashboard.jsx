import { useState, useEffect } from "react";
import TestimonialsDashboard from "./testimonials_admin";
import ServicesDashboard from "./services_admin";

// ── Nav config ────────────────────────────────────────────────────
const NAV = [
  {
    section: "Manage",
    items: [
      { id: "testimonials", label: "Testimonials", icon: "⭐" },
      { id: "members",      label: "Members",      icon: "👤", soon: true },
      { id: "services",     label: "Services",     icon: "🛠️" },
    ],
  },
];

const PAGE_LABEL = {
  testimonials: "Testimonials",
  members:      "Members",
  services:     "Services",
};

// ── Clock ─────────────────────────────────────────────────────────
function LiveTime({ collapsed }) {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (collapsed) return null;
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(193,232,255,0.45)", letterSpacing: "0.08em" }}>
      {time}
    </span>
  );
}

// ── Placeholder ───────────────────────────────────────────────────
function ComingSoon({ label, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: 32, textAlign: "center" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", fontSize: 28 }}>
        {icon}
      </div>
      <p style={{ marginBottom: 6, fontSize: 16, fontWeight: 600, color: "#1e293b", fontFamily: "'Sora', sans-serif" }}>{label}</p>
      <p style={{ maxWidth: 300, fontSize: 13, lineHeight: 1.6, color: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        This section is under construction. Check back soon for full {label.toLowerCase()} management.
      </p>
      <span style={{ marginTop: 16, borderRadius: 999, border: "1px dashed #cbd5e1", background: "#f1f5f9", padding: "4px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#94a3b8" }}>
        coming soon
      </span>
    </div>
  );
}

// ── Logout Confirmation Modal ─────────────────────────────────────
function LogoutModal({ onCancel, onConfirm }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,7,20,0.80)", backdropFilter: "blur(4px)",
    }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#071a3e",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 16, padding: "28px 28px 22px",
          width: 320, boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          animation: "modalIn 0.18s ease",
        }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }`}</style>

        <div style={{ fontSize: 36 }}>🚪</div>

        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Sora', sans-serif", textAlign: "center" }}>
          Sign out?
        </p>

        <p style={{ margin: 0, fontSize: 12, color: "rgba(193,232,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center", lineHeight: 1.6 }}>
          You'll be returned to the login page. Any unsaved changes will be lost.
        </p>

        <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 6 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)", fontFamily: "'Sora', sans-serif",
              fontSize: 13, fontWeight: 500, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
              color: "#fca5a5", fontFamily: "'Sora', sans-serif",
              fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.28)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}
          >
            Yes, sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ active, onSelect, collapsed, onToggle, onLogout }) {
  return (
    <aside
      style={{
        position: "fixed", inset: "0 auto 0 0", zIndex: 50,
        width: collapsed ? 64 : 240,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        background: "#051836",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Grid bg */}
      <div style={{
        pointerEvents: "none", position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64,7,219,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />

      {/* Glow */}
      <div style={{ pointerEvents: "none", position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,7,95,0.18) 0%, transparent 70%)" }} />

      {/* ── Logo row + toggle ── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 10,
        padding: collapsed ? "18px 0" : "18px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}>
        {/* Logo + text */}
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, overflow: "hidden" }}>
          <img
            src="/glow-logo.png"
            alt="NotionNik"
            style={{ height: 34, width: "auto", objectFit: "contain", flexShrink: 0 }}
          />
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#fff", fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap" }}>
                NotionNik
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 24, height: 24, flexShrink: 0,
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
            transition: "all 0.15s",
            marginTop: collapsed ? 8 : 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: "relative", zIndex: 10, flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "8px 0" : "8px 12px" }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 24 }}>
            {!collapsed && (
              <p style={{
                marginBottom: 6, padding: "0 8px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.25)",
              }}>
                {group.section}
              </p>
            )}
            {collapsed && <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "6px 10px" }} />}

            {group.items.map((item) => {
              const isActive = active === item.id;
              const letter   = item.label[0];

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 10,
                    width: "100%",
                    padding: collapsed ? "10px 0" : "8px 12px",
                    marginBottom: 2,
                    borderRadius: collapsed ? 0 : 8,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    textAlign: "left",
                    transition: "all 0.15s",
                    background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    overflow: "hidden",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}}
                >
                  {isActive && (
                    <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, borderRadius: "0 3px 3px 0", background: "#fff" }} />
                  )}

                  {collapsed ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 15, opacity: isActive ? 1 : 0.7, lineHeight: 1 }}>{item.icon}</span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9, fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}>
                        {letter}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span style={{ width: 20, flexShrink: 0, textAlign: "center", fontSize: 15, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{item.label}</span>
                      {item.soon && (
                        <span style={{ marginLeft: "auto", borderRadius: 4, background: "rgba(255,255,255,0.05)", padding: "2px 7px", fontFamily: "'JetBrains Mono', monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                          soon
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)", padding: collapsed ? "10px 0" : "12px" }}>

        {/* Expanded sign out */}
        {!collapsed && (
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            <span>🚪</span>
            <span>Sign out</span>
            <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.15)" }}>
              {new Date().getFullYear()}
            </span>
          </button>
        )}

        {/* Collapsed sign out icon */}
        {collapsed && (
          <button
            onClick={onLogout}
            title="Sign out"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "8px 0", marginTop: 6,
              background: "transparent", border: "none",
              cursor: "pointer", fontSize: 16,
              transition: "opacity 0.15s", opacity: 0.4,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
          >
            🚪
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Page Renderer ─────────────────────────────────────────────────
function PageContent({ active }) {
  switch (active) {
    case "testimonials": return <TestimonialsDashboard />;
    case "members":      return <ComingSoon label="Members" icon="👤" />;
    case "services":     return <ServicesDashboard />;
    default:             return null;
  }
}

// ── Main Export ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active,      setActive]      = useState("testimonials");
  const [collapsed,   setCollapsed]   = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) window.location.replace("/admin/login");
  }, []);

  function handleLogoutConfirm() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  }

  const sideW = collapsed ? 64 : 240;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f2f5", fontFamily: "'Sora', sans-serif" }}>

      {/* ── Logout confirmation ── */}
      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}

      <Sidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        onLogout={() => setShowLogout(true)}
      />

      {/* Main */}
      <div style={{
        marginLeft: sideW,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* ── Topbar ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 10,
          height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          background: "#051836",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(193,232,255,0.35)", letterSpacing: "0.08em" }}>
              admin
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em" }}>
              {PAGE_LABEL[active]}
            </span>
          </div>

          {/* Right: time + admin badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LiveTime collapsed={collapsed} />

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />

            {/* Admin pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px 5px 6px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "linear-gradient(135deg, #2d8ef5, #1a5fc0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}>
                A
              </div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(193,232,255,0.75)", whiteSpace: "nowrap" }}>
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main key={active} style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
          <PageContent active={active} />
        </main>
      </div>
    </div>
  );
}