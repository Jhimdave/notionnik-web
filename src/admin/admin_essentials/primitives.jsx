import { useState, useRef, useEffect } from "react";
import { T, inputStyle, CATEGORIES, STATUSES, TOOLS_LIST } from "./constants";
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
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, textAlign: "center", margin: "0 0 8px" }}>Delete item?</h3>
        <p style={{ fontSize: 13, color: T.textSecond, textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
          This will permanently remove <strong style={{ color: T.textPrimary }}>{item?.title || item?.displayName || "this item"}</strong>. This cannot be undone.
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

// ─────────────────────────────────────────────────────────────────
// ── Testimonial-specific primitives (added) ───────────────────────
// ─────────────────────────────────────────────────────────────────

// ── Avatar ────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 32 }) {
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1px solid ${T.borderStrong}`, flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(59,130,246,0.2)", border: `1px solid ${T.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: "#7eb3fa", flexShrink: 0 }}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>;
}

// ── StarRating ────────────────────────────────────────────────────
export function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          onClick={() => onChange && onChange(n === value ? 0 : n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ fontSize: onChange ? 26 : 13, cursor: onChange ? "pointer" : "default", color: n <= (hovered || value) ? "#f59e0b" : "#1e3a6e", transition: "color 0.1s", userSelect: "none" }}>
          ★
        </span>
      ))}
      {value > 0 && onChange && (
        <span style={{ fontSize: 11, color: T.textMuted, alignSelf: "center", marginLeft: 4 }}>{value}/5</span>
      )}
    </div>
  );
}

// ── ClientCard ────────────────────────────────────────────────────
export function ClientCard({ client, onClear }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 9, marginTop: 6 }}>
      <Avatar name={client.name} src={client.avatar} size={36} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: T.textPrimary }}>{client.name}</p>
        <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
      </div>
      <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: T.textMuted }}>×</button>
    </div>
  );
}

// ── ContractTitleField ────────────────────────────────────────────
export function ContractTitleField({ clientContractTitle, value, onChange }) {
  const [useCustom, setUseCustom] = useState(false);
  useEffect(() => setUseCustom(false), [clientContractTitle]);

  if (!clientContractTitle) {
    return <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. 60 minute consultation" />;
  }
  if (useCustom) {
    return (
      <div style={{ display: "flex", gap: 5 }}>
        <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder="Custom contract title…" autoFocus />
        <button onClick={() => { setUseCustom(false); onChange(clientContractTitle); }}
          style={{ padding: "7px 9px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "#0a1f4a", color: T.textSecond, cursor: "pointer", whiteSpace: "nowrap" }}>
          ← Use client's
        </button>
      </div>
    );
  }
  return (
    <div>
      <select style={inputStyle} value={value}
        onChange={e => { if (e.target.value === "__custom__") { setUseCustom(true); onChange(""); } else onChange(e.target.value); }}>
        <option value={clientContractTitle}>{clientContractTitle}</option>
        <option value="__custom__">Custom…</option>
      </select>
      <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Auto-filled · choose "Custom…" to override</p>
    </div>
  );
}

// ── DynamicField — editable input per Notion property type ────────
export function DynamicField({ prop, value, onChange }) {
  const { name, type, options: propOptions = [] } = prop;

  if (type === "multi_select") {
    const available = propOptions.map(o => o.name);
    const selected  = Array.isArray(value) ? value : [];
    return (
      <Field label={name}>
        {available.length > 0 ? (
          <PillToggle options={available} selected={selected}
            onToggle={opt => { const next = selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt]; onChange(next); }}
            activeColor="#a78bfa" activeBg="rgba(167,139,250,0.1)" />
        ) : (
          <input style={inputStyle} value={selected.join(", ")}
            onChange={e => onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="comma-separated values…" />
        )}
      </Field>
    );
  }
  if (type === "select") {
    const available = propOptions.map(o => o.name);
    return (
      <Field label={name}>
        <select style={{ ...inputStyle, cursor: "pointer" }} value={value || ""} onChange={e => onChange(e.target.value)}>
          <option value="">— none —</option>
          {available.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
    );
  }
  if (type === "checkbox") {
    return (
      <Field label={name}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: T.blue, cursor: "pointer" }} />
          <span style={{ fontSize: 12, color: T.textSecond }}>{value ? "Enabled" : "Disabled"}</span>
        </label>
      </Field>
    );
  }
  if (type === "number") {
    return (
      <Field label={name}>
        <input type="number" style={inputStyle} value={value ?? ""}
          onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))} placeholder="0" />
      </Field>
    );
  }
  if (type === "date") {
    return (
      <Field label={name}>
        <input type="date" style={{ ...inputStyle, colorScheme: "dark" }} value={value || ""} onChange={e => onChange(e.target.value)} />
      </Field>
    );
  }
  if (type === "url") {
    return (
      <Field label={name}>
        <input type="url" style={inputStyle} value={value || ""} onChange={e => onChange(e.target.value)} placeholder="https://…" />
      </Field>
    );
  }
  if (type === "email") {
    return (
      <Field label={name}>
        <input type="email" style={inputStyle} value={value || ""} onChange={e => onChange(e.target.value)} placeholder="name@example.com" />
      </Field>
    );
  }
  if (type === "phone_number") {
    return (
      <Field label={name}>
        <input type="tel" style={inputStyle} value={value || ""} onChange={e => onChange(e.target.value)} placeholder="+1 (555) 000-0000" />
      </Field>
    );
  }
  return (
    <Field label={name}>
      <input style={inputStyle} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={`Enter ${name.toLowerCase()}…`} />
    </Field>
  );
}