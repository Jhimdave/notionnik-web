import { useState, useEffect } from "react";
import TestimonialsDashboard from "./testimonials_admin";

// ── Nav config ────────────────────────────────────────────────────
const NAV = [
  {
    section: "Manage",
    items: [
      { id: "testimonials", label: "Testimonials", icon: "⭐" },
      { id: "members", label: "Members", icon: "👤", soon: true },
      { id: "services", label: "Services", icon: "🛠️", soon: true },
    ],
  },
];

// ── Clock ─────────────────────────────────────────────────────────
function LiveTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 30000);

    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] text-gray-400">
      {time}
    </span>
  );
}

// ── Placeholder ───────────────────────────────────────────────────
function ComingSoon({ label, icon }) {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
        {icon}
      </div>

      <p className="mb-1 text-lg font-semibold text-gray-900">
        {label}
      </p>

      <p className="max-w-[300px] text-sm leading-6 text-gray-400">
        This section is under construction. Check back soon for full{" "}
        {label.toLowerCase()} management.
      </p>

      <span className="mt-4 rounded-full border border-dashed border-gray-300 bg-gray-100 px-4 py-1 font-mono text-[11px] text-gray-500">
        coming soon
      </span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ active, onSelect }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col overflow-hidden border-r border-white/5 bg-[#051836]">
      {/* Grid Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(64,7,219,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(5,7,95,0.18)_0%,transparent_70%)]" />

      {/* Logo */}
      <div className="relative z-10 mb-2 flex items-center gap-3 border-b border-white/5 px-5 py-6">
        <img
          src="/glow-logo.png"
          alt="NotionNik"
          className="h-9 w-auto object-contain"
        />

        <div className="flex flex-col gap-[1px]">
          <span className="text-sm font-semibold tracking-[-0.02em] text-white">
            NotionNik
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="relative z-10 flex-1 overflow-y-auto px-3 py-2"
        aria-label="Admin navigation"
      >
        {NAV.map((group) => (
          <div key={group.section} className="mb-6">
            <p className="mb-2 px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
              {group.section}
            </p>

            {group.items.map((item) => {
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-150 ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/45 hover:bg-white/5 hover:text-white/75"
                  }`}
                >
                  {/* Active Line */}
                  {isActive && (
                    <span className="absolute bottom-[6px] left-0 top-[6px] w-[3px] rounded-r bg-white" />
                  )}

                  {/* Icon */}
                  <span
                    className={`w-5 flex-shrink-0 text-center text-base ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span>{item.label}</span>

                  {/* Soon Badge */}
                  {item.soon && (
                    <span className="ml-auto rounded bg-white/5 px-2 py-[2px] font-mono text-[8px] uppercase tracking-wide text-white/30">
                      soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/5 p-4">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/40 transition-all duration-150 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <span>🚪</span>

          <span>Sign out</span>

          <span className="ml-auto font-mono text-[9px] text-white/15">
            {new Date().getFullYear()}
          </span>
        </button>
      </div>
    </aside>
  );
}

// ── Page Renderer ────────────────────────────────────────────────
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

// ── Page Labels ──────────────────────────────────────────────────
const PAGE_LABEL = {
  testimonials: "Testimonials",
  members: "Members",
  services: "Services",
};

// ── Main Export ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active, setActive] = useState("testimonials");

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      window.location.replace("/admin/login");
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5] font-['Sora']">
      {/* Sidebar */}
      <Sidebar active={active} onSelect={setActive} />

      {/* Main */}
      <div className="ml-[240px] flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-7">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">
              admin
            </span>

            <span className="text-gray-300">/</span>

            <span className="text-sm font-semibold text-gray-900">
              {PAGE_LABEL[active]}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <LiveTime />

            <div
              title="Admin"
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[#051836] text-[11px] font-semibold text-white"
            >
              A
            </div>
          </div>
        </header>

        {/* Page */}
        <main
          key={active}
          className="flex-1 overflow-x-auto overflow-y-auto"
        >
          <PageContent active={active} />
        </main>
      </div>
    </div>
  );
}