import { useState, useEffect, useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;
const API_KEY  = import.meta.env.VITE_API_CLIENT_KEY;

// ── Tiny keyframe injector ────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }

  .al-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .al-wrap {
    font-family: 'Sora', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    background: #051836;
    position: relative;
    overflow: hidden;
  }

  /* Subtle grid lines in background */
  .al-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(15, 2, 46, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(64, 7, 219, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Glow blob */
  .al-blob {
    position: absolute;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(5, 7, 95, 0.12) 0%, transparent 70%);
    top: -160px;
    right: -140px;
    pointer-events: none;
  }
  .al-blob2 {
    position: absolute;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
    bottom: -100px;
    left: -80px;
    pointer-events: none;
  }

  /* Left decorative panel (desktop) */
  .al-panel {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    width: 420px;
    flex-shrink: 0;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative;
    z-index: 1;
  }
  @media (min-width: 900px) {
    .al-panel { display: flex; }
  }

  .al-panel-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .al-panel-icon {
    width: 38px;
    height: 38px;
    background: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .al-panel-brand {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.02em;
  }
  .al-panel-tag {
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .al-panel-quote {
    font-size: 22px;
    font-weight: 300;
    color: rgba(255,255,255,0.75);
    line-height: 1.55;
    letter-spacing: -0.02em;
  }
  .al-panel-quote strong {
    color: #fff;
    font-weight: 500;
  }

  .al-panel-footer {
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
  }

  /* Right form side */
  .al-form-side {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 1;
  }

  .al-card {
    width: 100%;
    max-width: 400px;
    animation: fadeUp 0.45s ease both;
  }

  /* Mobile-only logo */
  .al-mobile-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2.5rem;
  }
  @media (min-width: 900px) {
    .al-mobile-logo { display: none; }
  }
  .al-mobile-icon {
    width: 34px;
    height: 34px;
    background: #fff;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .al-mobile-brand {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .al-heading {
    font-size: 26px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
    animation: fadeUp 0.45s 0.05s ease both;
  }
  .al-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 2.25rem;
    animation: fadeUp 0.45s 0.1s ease both;
  }

  .al-field {
    margin-bottom: 16px;
    animation: fadeUp 0.45s 0.15s ease both;
  }
  .al-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .al-input-wrap {
    position: relative;
  }
  .al-input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    color: rgba(255,255,255,0.25);
    pointer-events: none;
    line-height: 1;
  }
  .al-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 44px 11px 40px;
    font-size: 14px;
    font-family: 'Sora', sans-serif;
    color: #fff;
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    -webkit-text-security: disc;
  }
  .al-input[type="text"] {
    -webkit-text-security: none;
  }
  .al-input::placeholder { color: rgba(255,255,255,0.2); }
  .al-input:focus {
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
  }
  .al-input.error {
    border-color: rgba(239,68,68,0.6);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
    animation: shake 0.35s ease;
  }
  .al-eye {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px;
    color: rgba(255,255,255,0.25);
    font-size: 15px;
    line-height: 1;
    transition: color 0.15s;
  }
  .al-eye:hover { color: rgba(255,255,255,0.6); }

  .al-alert {
    padding: 10px 13px;
    border-radius: 9px;
    font-size: 12.5px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeUp 0.2s ease both;
  }
  .al-alert-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
  }
  .al-alert-success {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    color: #6ee7b7;
  }

  .al-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: #fff;
    color: #062452;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    margin-top: 4px;
    letter-spacing: -0.01em;
    animation: fadeUp 0.45s 0.2s ease both;
  }
  .al-btn:hover:not(:disabled) { background: #e5e7eb; }
  .al-btn:active:not(:disabled) { transform: scale(0.985); }
  .al-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .al-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0,0,0,0.15);
    border-top-color: #0d0f12;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  .al-footer {
    margin-top: 2rem;
    font-size: 11px;
    color: rgba(255,255,255,0.18);
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
    text-align: center;
    animation: fadeUp 0.45s 0.25s ease both;
  }
`;

export default function AdminLogin() {
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState(null); // { type: "error"|"success", msg: string }
  const [inputErr, setInputErr]   = useState(false);
  const inputRef                  = useRef(null);

  // Inject styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleLogin(e) {
    e?.preventDefault();

    if (!password.trim()) {
      setInputErr(true);
      setAlert({ type: "error", msg: "Please enter your password." });
      inputRef.current?.focus();
      setTimeout(() => setInputErr(false), 400);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res  = await fetch(`${BASE_URL}/admin/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body:    JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials.");
      }

      // Persist token if provided
      if (data.token) localStorage.setItem("admin_token", data.token);

      setAlert({ type: "success", msg: "Access granted — redirecting…" });

      setTimeout(() => {
        window.location.href = data.redirect || "/admin/dashboard";
      }, 900);

    } catch (err) {
      setInputErr(true);
      setAlert({ type: "error", msg: err.message || "Login failed. Try again." });
      setLoading(false);
      setTimeout(() => setInputErr(false), 400);
    }
  }

  return (
    <div className="al-wrap">
      <div className="al-blob"  aria-hidden="true" />
      <div className="al-blob2" aria-hidden="true" />

      {/* ── Left decorative panel (desktop only) ─────────────── */}
      <aside className="al-panel" aria-hidden="true">
        <div className="al-panel-logo">
          <div className="al-panel-icon">⚡</div>
          <div>
            <div className="al-panel-brand">NotionNik</div>
            <div className="al-panel-tag">ADMIN CONSOLE</div>
          </div>
        </div>

        <blockquote className="al-panel-quote">
          "Manage your testimonials,<br />
          clients & projects —<br />
          <strong>all in one place.</strong>"
        </blockquote>

        <p className="al-panel-footer">
          © {new Date().getFullYear()} NotionNik · restricted access
        </p>
      </aside>

      {/* ── Right form side ───────────────────────────────────── */}
      <main className="al-form-side">
        <div className="al-card">

          {/* Mobile-only logo */}
          <div className="al-mobile-logo" aria-hidden="true">
            <div className="al-mobile-icon">⚡</div>
            <div className="al-mobile-brand">NotionNik</div>
          </div>

          <h1 className="al-heading">Welcome back</h1>
          <p className="al-sub">Enter your admin password to continue</p>

          {/* Alert */}
          {alert && (
            <div
              className={`al-alert al-alert-${alert.type}`}
              role="alert"
              aria-live="polite"
            >
              <span>{alert.type === "error" ? "⚠" : "✓"}</span>
              <span>{alert.msg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Password field */}
            <div className="al-field">
              <label className="al-label" htmlFor="admin-password">
                Password
              </label>
              <div className="al-input-wrap">
                <span className="al-input-icon" aria-hidden="true">🔒</span>
                <input
                  ref={inputRef}
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  className={`al-input${inputErr ? " error" : ""}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setAlert(null); }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  disabled={loading}
                  aria-describedby={alert ? "al-alert-msg" : undefined}
                />
                <button
                  type="button"
                  className="al-eye"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="al-btn"
              disabled={loading}
            >
              {loading
                ? <><div className="al-spinner" /> Verifying…</>
                : <>Sign in →</>
              }
            </button>
          </form>

          <p className="al-footer">
            admin · {new Date().getFullYear()} · restricted
          </p>
        </div>
      </main>
    </div>
  );
}