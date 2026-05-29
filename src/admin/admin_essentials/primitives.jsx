import { useRef } from "react";
import { T, inputStyle } from "./constants";
import { statusStyle } from "./helper";

// ── Field wrapper ─────────────────────────────────────────────────
export function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: T.textSecond, display: "block", marginBottom: 4, fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

// ── Pill toggle ───────────────────────────────────────────────────
export function PillToggle({ options, selected, onToggle, activeColor = T.blue, activeBg = T.blueDim }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: "4px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid", fontFamily: "inherit",
            borderColor: active ? activeColor  : T.borderStrong,
            background:  active ? activeBg     : "transparent",
            color:       active ? activeColor  : T.textSecond,
            fontWeight:  active ? 500 : 400, transition: "all 0.15s",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── Upload zone ───────────────────────────────────────────────────
export function UploadZone({ label, hint, emoji, preview, onChange }) {
  const ref = useRef();
  function handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB."); ref.current.value = ""; return; }
    onChange(file);
  }
  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        border: `1.5px dashed ${T.borderStrong}`, borderRadius: 9, padding: "14px 10px",
        textAlign: "center", cursor: "pointer", background: T.navyDeep,
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.borderStrong}
      >
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</div>
        <p style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{hint} · Max 5 MB</p>
      </div>
      {preview && (
        <img src={preview} alt="preview" style={{ width: "100%", height: 80, objectFit: "contain", borderRadius: 7, marginTop: 6, border: `1px solid ${T.borderStrong}`, background: "rgba(0,0,0,0.3)" }} />
      )}
    </div>
  );
}

// ── Alert box ─────────────────────────────────────────────────────
export function AlertBox({ result }) {
  if (!result) return null;
  const ok = result.type === "success";
  return (
    <div style={{
      padding: "9px 12px", borderRadius: 7, fontSize: 12, marginBottom: 10,
      background: ok ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
      color:      ok ? "#4ade80"               : "#f87171",
      border: `1px solid ${ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
    }}>{result.msg}</div>
  );
}

// ── Dynamic cell renderer ─────────────────────────────────────────
export function DynamicCell({ value, type }) {
  if (value === null || value === undefined || value === "") {
    return <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>;
  }
  if (type === "checkbox") {
    return <span style={{ fontSize: 13 }}>{value ? "✅" : "☐"}</span>;
  }
  if (type === "multi_select" && Array.isArray(value)) {
    if (!value.length) return <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {value.slice(0, 3).map(v => (
          <span key={v} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: T.blueDim, color: "#7eb3fa", border: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{v}</span>
        ))}
        {value.length > 3 && <span style={{ fontSize: 9, color: T.textMuted }}>+{value.length - 3}</span>}
      </div>
    );
  }
  if (type === "select" || type === "status") {
    const ss = statusStyle(value);
    return (
      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, whiteSpace: "nowrap" }}>
        {value}
      </span>
    );
  }
  if (type === "url") {
    return (
      <a href={value} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
        style={{ fontSize: 11, color: T.blue, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
        {value.replace(/^https?:\/\//, "")}
      </a>
    );
  }
  if (type === "files" && Array.isArray(value)) {
    if (!value.length) return <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>;
    return (
      <a href={value[0]} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 26, borderRadius: 4, background: T.blueDim, border: `1px solid ${T.borderStrong}`, fontSize: 9, color: "#7eb3fa", textDecoration: "none" }}>
        📎
      </a>
    );
  }
  if (type === "number") {
    return <span style={{ color: T.textPrimary, fontWeight: 500, fontSize: 12 }}>{value}</span>;
  }
  return <span style={{ color: T.textSecond, fontSize: 11 }}>{String(value)}</span>;
}

// ── Delete confirmation modal ─────────────────────────────────────
export function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 14, padding: "28px 28px 24px", width: 380, zIndex: 1 }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, textAlign: "center", margin: "0 0 8px" }}>Delete service?</h3>
        <p style={{ fontSize: 13, color: T.textSecond, textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
          This will permanently remove <strong style={{ color: T.textPrimary }}>{item?.title || "this service"}</strong>. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", border: `1px solid ${T.borderStrong}`, borderRadius: 8, background: "transparent", color: T.textSecond, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 8, background: loading ? "#4b5563" : "#dc2626", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}