import { useState, useEffect, useRef } from "react";

const BASE_URL    = "https://notionnik-backend-production.up.railway.app" || import.meta.env.VITE_API_URL;
const API_KEY     = import.meta.env.VITE_API_CLIENT_KEY;
const API_KEY_GET = import.meta.env.VITE_API_SECRET;

// ── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
  navy:        "#000e2b",
  navyCard:    "#071a3e",
  navyRow:     "#0a1f4a",
  navyRowAlt:  "#0d2454",
  navyDeep:    "#051229",
  border:      "rgba(59,130,246,0.18)",
  borderStrong:"rgba(59,130,246,0.35)",
  blue:        "#3b82f6",
  blueDim:     "rgba(59,130,246,0.15)",
  textPrimary: "#e8edf8",
  textSecond:  "#8fafd4",
  textMuted:   "#4d6fa0",
};

const CATEGORIES = [
  "Notion x Automation","Notion Setup","Google App Script",
  "Consultation","Website Development","Automation",
];
const TOOLS_LIST = [
  "Notion","Automation","Google App Script","Zapier","Make",
  "Airtable","Go High Level","CRM","Slack","React","TailwindCSS",
];
const STATUSES = [
  "To Gather Data","Screenshot Editing","Data Gathering",
  "Screenshot Edited","Approved",
];
const PROPERTY_TYPES = [
  { value: "rich_text",    label: "Text" },
  { value: "number",       label: "Number" },
  { value: "select",       label: "Select" },
  { value: "multi_select", label: "Multi-select" },
  { value: "date",         label: "Date" },
  { value: "checkbox",     label: "Checkbox" },
  { value: "url",          label: "URL" },
  { value: "email",        label: "Email" },
  { value: "phone_number", label: "Phone" },
  { value: "files",        label: "Files" },
  { value: "people",       label: "People" },
];
const NOTION_COLORS = [
  "default","gray","brown","orange","yellow","green","blue","purple","pink","red",
];
const COLOR_DOTS = {
  default:"#9ca3af", gray:"#6b7280", brown:"#92400e", orange:"#c2410c",
  yellow:"#b45309",  green:"#16a34a", blue:"#1d4ed8",  purple:"#7c3aed",
  pink:"#be185d",    red:"#dc2626",
};

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  "Approved":           { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",   color: "#4ade80" },
  "Screenshot Edited":  { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   color: "#facc15" },
  "Screenshot Editing": { bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)",  color: "#fb923c" },
  "Data Gathering":     { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)",  color: "#7eb3fa" },
  "To Gather Data":     { bg: "rgba(100,116,139,0.12)",border: "rgba(100,116,139,0.3)", color: "#94a3b8" },
};
function statusStyle(s) {
  return STATUS_COLORS[s] || { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)", color: "#94a3b8" };
}

// ── Category styles ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Notion x Automation": { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   color: "#facc15" },
  "Notion Setup":        { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)",  color: "#c084fc" },
  "Automation":          { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   color: "#facc15" },
  "Website Development": { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   color: "#4ade80" },
  "Google App Script":   { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   color: "#f87171" },
  "Consultation":        { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  color: "#7eb3fa" },
};
function categoryStyle(c) {
  return CATEGORY_COLORS[c] || { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)", color: "#94a3b8" };
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", fontSize: 13, padding: "7px 10px",
  border: `1px solid ${T.borderStrong}`, borderRadius: 7,
  background: T.navyDeep, color: T.textPrimary, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const sectionLabel = {
  fontSize: 10, fontWeight: 700, color: T.textMuted,
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
};
const divider = { height: 1, background: T.border, margin: "18px 0" };

// ── Helper: resolve reviewer role from various possible API shapes ─────────────
// The formula "Client.map(current.Role).first()" may come back under different keys
function resolveRole(item) {
  return (
    item.reviewerRole     ||  // most likely mapped key
    item.role             ||  // some APIs flatten it here
    item["Reviewer Role"] ||  // raw Notion property name
    item.clientRole       ||
    item.client_role      ||
    ""
  );
}

// ── Helper: resolve client avatar/profile image ONLY — never screenshots ──────
// Strictly pulls from avatar/profile fields; screenshot fields are intentionally excluded.
function resolveImageUrl(item) {
  const candidates = [
    item.image,
    item.avatar,
    item.clientImage,
    item.client_image,
    item.profileImage,
    item.profile_image,
    item.photo,
    item.clientAvatar,
    item.client_avatar,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string" && c.startsWith("http")) return c;
    if (Array.isArray(c) && c[0]) {
      const first = c[0];
      if (typeof first === "string") return first;
      if (first?.url) return first.url;
      if (first?.file?.url) return first.file.url;
      if (first?.external?.url) return first.external.url;
    }
    if (c?.url) return c.url;
    if (c?.file?.url) return c.file.url;
  }
  return null;
}

// ── Helper: resolve screenshot URLs specifically ──────────────────────────────
function resolveScreenshot(val) {
  if (!val) return null;
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (Array.isArray(val) && val.length > 0) {
    const first = val[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.file?.url) return first.file.url;
    if (first?.external?.url) return first.external.url;
  }
  if (val?.url) return val.url;
  if (val?.file?.url) return val.file.url;
  return null;
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
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

// ── StarRating ────────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange && onChange(n === value ? 0 : n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: onChange ? 26 : 13, cursor: onChange ? "pointer" : "default",
            color: n <= (hovered || value) ? "#f59e0b" : "#1e3a6e",
            transition: "color 0.1s", userSelect: "none",
          }}
        >★</span>
      ))}
      {value > 0 && onChange && (
        <span style={{ fontSize: 11, color: T.textMuted, alignSelf: "center", marginLeft: 4 }}>{value}/5</span>
      )}
    </div>
  );
}

// ── UploadZone ────────────────────────────────────────────────────────────────
function UploadZone({ label, hint, emoji, preview, onChange }) {
  const ref = useRef();

  function handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      ref.current.value = ""; // reset input
      return;
    }
    onChange(file);
  }

  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        border: `1.5px dashed ${T.borderStrong}`, borderRadius: 9, padding: "14px 10px",
        textAlign: "center", cursor: "pointer", background: T.navyDeep,
        transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.borderStrong}
      >
        <input ref={ref} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
          style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
        <p style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{hint}</p>
        {/* ← size limit badge */}
        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Max 5MB</p>
      </div>
      {preview && <img src={preview} alt="preview"
        style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 7, marginTop: 6, border: `1px solid ${T.borderStrong}` }} />}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, src, size = 32 }) {
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1px solid ${T.borderStrong}`, flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(59,130,246,0.2)", border: `1px solid ${T.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: "#7eb3fa", flexShrink: 0 }}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>;
}

// ── ClientCard ────────────────────────────────────────────────────────────────
function ClientCard({ client, onClear }) {
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

// ── ContractTitleField ────────────────────────────────────────────────────────
function ContractTitleField({ clientContractTitle, value, onChange }) {
  const [useCustom, setUseCustom] = useState(false);
  useEffect(() => setUseCustom(false), [clientContractTitle]);

  if (!clientContractTitle) return <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. 60 minute consultation" />;
  if (useCustom) return (
    <div style={{ display: "flex", gap: 5 }}>
      <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder="Custom contract title…" autoFocus />
      <button onClick={() => { setUseCustom(false); onChange(clientContractTitle); }}
        style={{ padding: "7px 9px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: T.navyRow, color: T.textSecond, cursor: "pointer", whiteSpace: "nowrap" }}>
        ← Use client's
      </button>
    </div>
  );
  return (
    <div>
      <select style={inputStyle} value={value} onChange={e => { if (e.target.value === "__custom__") { setUseCustom(true); onChange(""); } else onChange(e.target.value); }}>
        <option value={clientContractTitle}>{clientContractTitle}</option>
        <option value="__custom__">Custom…</option>
      </select>
      <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Auto-filled · choose "Custom…" to override</p>
    </div>
  );
}

// ── PillToggle ────────────────────────────────────────────────────────────────
function PillToggle({ options, selected, onToggle, activeColor = T.blue, activeBg = T.blueDim }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid", fontFamily: "inherit",
            borderColor: active ? activeColor : T.borderStrong,
            background:  active ? activeBg   : "transparent",
            color:       active ? activeColor : T.textSecond,
            fontWeight:  active ? 500 : 400, transition: "all 0.15s",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── DeleteModal ───────────────────────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 14, padding: "28px 28px 24px", width: 380, zIndex: 1 }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, textAlign: "center", margin: "0 0 8px" }}>Delete testimonial?</h3>
        <p style={{ fontSize: 13, color: T.textSecond, textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
          This will permanently remove the record for <strong style={{ color: T.textPrimary }}>{item?.displayName || "this client"}</strong>. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", border: `1px solid ${T.borderStrong}`, borderRadius: 8, background: "transparent", color: T.textSecond, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 8, background: loading ? "#4b5563" : "#dc2626", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 16, width: "100%", maxWidth: 680, zIndex: 1, animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}`, background: T.navyDeep, borderRadius: "16px 16px 0 0" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.textMuted, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: "20px 24px 24px", overflowY: "auto", maxHeight: "calc(90vh - 70px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── PropertiesModal ───────────────────────────────────────────────────────────
function PropertiesModal({ onClose }) {
  const [tab, setTab]                   = useState("add");
  const [props, setProps]               = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsError, setPropsError]     = useState(null);
  const [newName, setNewName]           = useState("");
  const [newType, setNewType]           = useState("rich_text");
  const [options, setOptions]           = useState([{ name: "", color: "default" }]);
  const [adding, setAdding]             = useState(false);
  const [addResult, setAddResult]       = useState(null);
  const [deletingName, setDeletingName] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);
  const needsOptions = newType === "select" || newType === "multi_select";

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => { fetchProps(); }, []);

  async function fetchProps() {
    setPropsLoading(true); setPropsError(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/testimonials/db-properties`, { headers: { "x-api-key": API_KEY } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProps(data.data);
    } catch (err) { setPropsError(err.message); }
    finally { setPropsLoading(false); }
  }

  function addOption() { setOptions(prev => [...prev, { name: "", color: "default" }]); }
  function removeOption(i) { setOptions(prev => prev.filter((_, idx) => idx !== i)); }
  function updateOption(i, key, val) { setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, [key]: val } : o)); }

  async function handleAdd() {
    if (!newName.trim()) return setAddResult({ type: "error", msg: "Property name is required." });
    setAdding(true); setAddResult(null);
    try {
      const body = { name: newName.trim(), type: newType };
      if (needsOptions) body.options = options.filter(o => o.name.trim()).map(o => ({ name: o.name.trim(), color: o.color }));
      const res  = await fetch(`${BASE_URL}/admin/create-testimonial/new-property`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAddResult({ type: "success", msg: `✓ "${newName.trim()}" added!` });
      setNewName(""); setNewType("rich_text"); setOptions([{ name: "", color: "default" }]);
      fetchProps();
    } catch (err) { setAddResult({ type: "error", msg: err.message }); }
    finally { setAdding(false); }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingName(name); setDeleteResult(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/delete-testimonial/property`, { method: "DELETE", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDeleteResult({ type: "success", msg: `✓ "${name}" deleted.` });
      fetchProps();
    } catch (err) { setDeleteResult({ type: "error", msg: err.message }); }
    finally { setDeletingName(null); }
  }

  const alert = (r) => r ? (
    <div style={{ padding: "8px 12px", borderRadius: 7, fontSize: 12, marginBottom: 10,
      background: r.type === "success" ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
      color:      r.type === "success" ? "#4ade80"               : "#f87171",
      border: `1px solid ${r.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
      {r.msg}
    </div>
  ) : null;

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{
      padding: "7px 16px", fontSize: 12, borderRadius: 7, cursor: "pointer", border: "none",
      fontFamily: "inherit", fontWeight: tab === id ? 600 : 400,
      background: tab === id ? T.blue : T.navyRow,
      color:      tab === id ? "#fff" : T.textSecond,
      display: "flex", alignItems: "center", gap: 5,
    }}>{icon} {label}</button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 16, width: "100%", maxWidth: 520, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px", borderBottom: `1px solid ${T.border}`, background: T.navyDeep, borderRadius: "16px 16px 0 0" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.textPrimary }}>🗂️ Manage Properties</h2>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textMuted }}>Add or remove columns from your Notion database</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.textMuted, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 6, padding: "14px 24px 0" }}>
          {tabBtn("add", "Add Property", "＋")}
          {tabBtn("remove", "Remove Property", "🗑")}
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          {tab === "add" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Property name" required>
                <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Budget, Priority, Notes…" />
              </Field>
              <Field label="Property type" required>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.value} onClick={() => setNewType(t.value)} style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      border: "1px solid", fontFamily: "inherit",
                      borderColor: newType === t.value ? T.blue    : T.borderStrong,
                      background:  newType === t.value ? T.blueDim : "transparent",
                      color:       newType === t.value ? T.blue    : T.textSecond,
                      fontWeight:  newType === t.value ? 500 : 400,
                    }}>{t.label}</button>
                  ))}
                </div>
              </Field>
              {needsOptions && (
                <div>
                  <div style={sectionLabel}>Options</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {options.map((opt, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <select value={opt.color} onChange={e => updateOption(i, "color", e.target.value)}
                          style={{ ...inputStyle, width: 32, height: 32, padding: 0, textAlign: "center", background: COLOR_DOTS[opt.color], color: "transparent", cursor: "pointer", borderRadius: 6 }}>
                          {NOTION_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input style={{ ...inputStyle, flex: 1 }} value={opt.name} onChange={e => updateOption(i, "name", e.target.value)} placeholder={`Option ${i + 1}…`} />
                        {options.length > 1 && (
                          <button onClick={() => removeOption(i)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 16, padding: "0 4px" }}>×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={addOption} style={{ alignSelf: "flex-start", fontSize: 11, color: T.blue, background: "none", border: `1px dashed ${T.borderStrong}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>+ Add option</button>
                  </div>
                </div>
              )}
              {alert(addResult)}
              <button onClick={handleAdd} disabled={adding} style={{ padding: "9px 0", fontSize: 13, border: "none", borderRadius: 8, background: adding ? "#4b5563" : T.blue, color: "#fff", cursor: adding ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {adding ? "⏳ Adding…" : "＋ Add property"}
              </button>
            </div>
          )}
          {tab === "remove" && (
            <div>
              {alert(deleteResult)}
              {propsLoading && <p style={{ fontSize: 12, color: T.textMuted, textAlign: "center", padding: "20px 0" }}>Loading properties…</p>}
              {propsError   && <p style={{ fontSize: 12, color: "#f87171" }}>⚠ {propsError}</p>}
              {!propsLoading && props.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 360, overflowY: "auto" }}>
                  {props.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.navyRow }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary }}>{p.name}</span>
                        <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.navyDeep, padding: "1px 6px", borderRadius: 4 }}>{p.type}</span>
                      </div>
                      {p.type === "title" ? (
                        <span style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>protected</span>
                      ) : (
                        <button onClick={() => handleDelete(p.name)} disabled={deletingName === p.name}
                          style={{ padding: "4px 10px", fontSize: 11, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, background: "transparent", color: "#f87171", cursor: deletingName === p.name ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deletingName === p.name ? 0.5 : 1 }}>
                          {deletingName === p.name ? "…" : "🗑️ Delete"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TestimonialForm ───────────────────────────────────────────────────────────
function TestimonialForm({ mode, initial, clients, clientsLoading, clientsError, onRetryClients, onSubmit, onCancel, submitting, result }) {
  const [feedback, setFeedback]                   = useState(initial?.feedback        || "");
  const [contractTitle, setContractTitle]         = useState(initial?.contractTitle   || "");
  const [projectTitle, setProjectTitle]           = useState(initial?.projectTitle    || "");
  const [category, setCategory]                   = useState(initial?.category        || "");
  const [credLink, setCredLink]                   = useState(initial?.credibilityLink || "");
  const [rating, setRating]                       = useState(initial?.rate            || 0);
  const [status, setStatus]                       = useState(initial?.status          || "");
  const [tools, setTools]                         = useState(new Set(initial?.tools   || []));
  const [selectedClient, setSelectedClient]       = useState(null);
  const [clientSearch, setClientSearch]           = useState("");
  const [screenshotFile, setScreenshotFile]       = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [rawFile, setRawFile]                     = useState(null);
  const [rawPreview, setRawPreview]               = useState(null);
  const isEdit = mode === "edit";

  const filteredClients = clients.filter(c => {
    const s = clientSearch.toLowerCase();
    return !clientSearch || c?.name?.toLowerCase()?.includes(s) || c?.company?.toLowerCase()?.includes(s);
  });

  function toggleTool(t) { setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function handleSubmit() { onSubmit({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, selectedClient, screenshotFile, rawFile }); }

  const alertBox = (r) => r ? (
    <div style={{ padding: "10px 12px", borderRadius: 7, marginBottom: 12, fontSize: 12,
      background: r.type === "success" ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
      color:      r.type === "success" ? "#4ade80"               : "#f87171",
      border: `1px solid ${r.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
      {r.msg}
    </div>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {!isEdit && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionLabel}>Client (relation)</div>
          {!selectedClient ? (
            <>
              <Field label="Search & select client" required hint="Type a name or company to filter">
                <input style={inputStyle} value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="e.g. Jack Andrews, EDGEhomes…" />
              </Field>
              {clientsLoading && <p style={{ fontSize: 12, color: T.textMuted, margin: "4px 0" }}>Loading clients…</p>}
              {clientsError && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "4px 0" }}>
                  <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>⚠ {clientsError}</p>
                  <button onClick={onRetryClients} style={{ fontSize: 11, color: T.blue, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Retry</button>
                </div>
              )}
              {filteredClients.length > 0 && (
                <div style={{ border: `1px solid ${T.borderStrong}`, borderRadius: 9, overflow: "hidden", marginTop: 4, maxHeight: 220, overflowY: "auto" }}>
                  {filteredClients.map((client, idx) => (
                    <div key={client.id}
                      onClick={() => { setSelectedClient(client); setClientSearch(""); if (client.contractTitle) setContractTitle(client.contractTitle); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", borderTop: idx > 0 ? `1px solid ${T.border}` : "none", background: T.navyRow, transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.navyRowAlt}
                      onMouseLeave={e => e.currentTarget.style.background = T.navyRow}
                    >
                      <Avatar name={client.name} src={client.avatar} size={32} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: T.textPrimary }}>{client.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
                      </div>
                      {client.contractTitle && <span style={{ fontSize: 10, color: T.textSecond, background: T.navyDeep, padding: "2px 7px", borderRadius: 20 }}>{client.contractTitle}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: T.textSecond, marginBottom: 3 }}>Selected client</p>
              <ClientCard client={selectedClient} onClear={() => { setSelectedClient(null); setContractTitle(""); }} />
            </>
          )}
          <div style={divider} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Feedback</div>
        <Field label="Feedback text" required>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={2000}
            placeholder="What did the client say…"
            style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }} />
          <div style={{ fontSize: 10, color: T.textMuted, textAlign: "right", marginTop: 2 }}>{feedback.length}/2000</div>
        </Field>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Project details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Contract title">
            <ContractTitleField clientContractTitle={selectedClient?.contractTitle ?? ""} value={contractTitle} onChange={setContractTitle} />
          </Field>
          <Field label="Project title">
            <input style={inputStyle} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="e.g. Notion Consultation" />
          </Field>
          <Field label="Category">
            <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">— select —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Credibility link">
            <input style={inputStyle} type="url" value={credLink} onChange={e => setCredLink(e.target.value)} placeholder="https://upwork.com/…" />
          </Field>
        </div>
      </div>

      <div style={divider} />

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Rating</div>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Status</div>
        <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="rgba(245,158,11,0.12)" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Tools used</div>
        <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} />
      </div>

      <div style={divider} />

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Screenshots</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <UploadZone label="Feedback screenshot" hint="Edited · JPG PNG WEBP" emoji="📸" preview={screenshotPreview} onChange={f => { setScreenshotFile(f); setScreenshotPreview(f ? URL.createObjectURL(f) : null); }} />
          <UploadZone label="Raw screenshot" hint="Original unedited" emoji="🗂️" preview={rawPreview} onChange={f => { setRawFile(f); setRawPreview(f ? URL.createObjectURL(f) : null); }} />
        </div>
      </div>

      {alertBox(result)}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting} style={{ padding: "8px 20px", fontSize: 12, border: "none", borderRadius: 7, background: submitting ? "#4b5563" : T.blue, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
          {submitting ? "⏳ Saving…" : isEdit ? "💾 Save changes" : "🚀 Create testimonial"}
        </button>
      </div>
    </div>
  );
}

// ── InlineEditRow ─────────────────────────────────────────────────────────────
function InlineEditRow({ item, colCount, onSave, onCancel, submitting, result }) {
  const [feedback, setFeedback]           = useState(item.feedback        || "");
  const [contractTitle, setContractTitle] = useState(item.contractTitle   || "");
  const [projectTitle, setProjectTitle]   = useState(item.projectTitle    || "");
  const [category, setCategory]           = useState(item.category        || "");
  const [credLink, setCredLink]           = useState(item.credibilityLink || "");
  const [rating, setRating]               = useState(item.rate            || 0);
  const [status, setStatus]               = useState(item.status          || "");
  const [tools, setTools]                 = useState(new Set(item.tools   || []));

  function toggleTool(t) { setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }

  return (
    <tr>
      <td colSpan={colCount} style={{ padding: "16px 20px", background: T.navyDeep, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 12 }}>
          <Field label="Feedback text" required>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Field label="Project title"><input style={inputStyle} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} /></Field>
            <Field label="Contract title"><input style={inputStyle} value={contractTitle} onChange={e => setContractTitle(e.target.value)} /></Field>
          </div>
          <Field label="Category">
            <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">— select —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Credibility link">
            <input style={inputStyle} type="url" value={credLink} onChange={e => setCredLink(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={sectionLabel}>Rating</div>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={sectionLabel}>Status</div>
          <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="rgba(245,158,11,0.12)" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={sectionLabel}>Tools</div>
          <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} />
        </div>
        {result && (
          <div style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 10, fontSize: 12,
            background: result.type === "success" ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
            color:      result.type === "success" ? "#4ade80"               : "#f87171",
            border: `1px solid ${result.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
            {result.msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "7px 14px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools })} disabled={submitting}
            style={{ padding: "7px 16px", fontSize: 12, border: "none", borderRadius: 7, background: submitting ? "#4b5563" : T.blue, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit" }}>
            {submitting ? "Saving…" : "💾 Save changes"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── ViewModal — now with Edit & Delete actions + fixed images & role ───────────
function ViewModal({ item, onClose, onEdit, onDelete, onSave, editSubmitting, editResult }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const ss           = statusStyle(item.status);
  const cs           = categoryStyle(item.category);
  const role         = resolveRole(item);
  // Screenshots — strictly from screenshot/file upload fields only
  // ✅ NEW
const ssUrl  = resolveScreenshot(item.feedbackScreenshot);
const rawUrl = resolveScreenshot(item.rawScreenshot);
  // Client avatar — strictly from profile/avatar fields, never screenshots
  const clientAvatar = resolveImageUrl(item);

  // ── Edit form state ───────────────────────────────────────────────────────
  const [feedback, setFeedback]           = useState(item.feedback        || "");
  const [contractTitle, setContractTitle] = useState(item.contractTitle   || "");
  const [projectTitle, setProjectTitle]   = useState(item.projectTitle    || "");
  const [category, setCategory]           = useState(item.category        || "");
  const [credLink, setCredLink]           = useState(item.credibilityLink || "");
  const [rating, setRating]               = useState(item.rate            || 0);
  const [status, setStatus]               = useState(item.status          || "");
  const [tools, setTools]                 = useState(new Set(item.tools   || []));
  const [screenshotFile, setScreenshotFile]       = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [rawFile, setRawFile]                     = useState(null);
  const [rawPreview, setRawPreview]               = useState(null);
  const [deleteFeedbackSs, setDeleteFeedbackSs]   = useState(false);
  const [deleteRawSs, setDeleteRawSs]             = useState(false);
  function toggleTool(t) { setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }

  function handleSave() {
  onSave(item.id, {
    feedback, contractTitle, projectTitle, category,
    credLink, rating, status, tools,
    screenshotFile, rawFile,         // ← NEW
    deleteFeedbackSs, deleteRawSs,   // ← NEW
  });
}

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 16, width: "100%", maxWidth: 580, zIndex: 1, animation: "modalIn 0.2s ease", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>

        {/* ── Sticky header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.navyDeep, borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
            {item.displayName} — Testimonial
          </h3>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ padding: "5px 12px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: T.blueDim, color: T.blue, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                  ✏️ Edit
                </button>
                <button
                  onClick={() => { onClose(); onDelete(item); }}
                  style={{ padding: "5px 12px", fontSize: 11, border: "1px solid rgba(239,68,68,0.35)", borderRadius: 7, background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                  🗑️ Delete
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                style={{ padding: "5px 12px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.textMuted, lineHeight: 1, marginLeft: 2 }}>×</button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px 22px" }}>

          {/* ════ VIEW MODE ════ */}
          {!isEditing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Client row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.blueDim, borderRadius: 9, border: `1px solid ${T.border}` }}>
                <Avatar name={item.displayName} src={clientAvatar} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.textPrimary }}>{item.displayName}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                    {[role, item.company].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <StarRating value={item.rate || 0} />
              </div>

              {/* Feedback */}
              <div>
                <div style={sectionLabel}>Feedback</div>
                <div style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.7, background: "rgba(0,7,20,0.4)", borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                  {item.feedback || "No feedback provided."}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["Project title",  item.projectTitle  || "—"],
                  ["Contract title", item.contractTitle || "—"],
                  ["Company",        item.company       || "—"],
                  ["Reviewer role",  role               || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>{val}</div>
                  </div>
                ))}

                <div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Status</div>
                  {item.status
                    ? <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }}>{item.status}</span>
                    : <span style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>—</span>}
                </div>

                <div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Category</div>
                  {item.category
                    ? <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color }}>{item.category}</span>
                    : <span style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>—</span>}
                </div>
              </div>

              {/* Tools */}
              {item.tools?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Tools used</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {item.tools.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, background: T.blueDim, color: "#7eb3fa", border: `1px solid ${T.borderStrong}` }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Screenshots ── */}
              {(ssUrl || rawUrl) && (
                <div>
                  <div style={sectionLabel}>Screenshots</div>
                  <div style={{ display: "grid", gridTemplateColumns: ssUrl && rawUrl ? "1fr 1fr" : "1fr", gap: 10 }}>
                    {ssUrl && (
                      <div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>📸 Feedback screenshot</div>
                        <a href={ssUrl} target="_blank" rel="noreferrer">
                          <img
                            src={ssUrl}
                            alt="Feedback screenshot"
                            style={{ width: "100%", borderRadius: 8, border: `1px solid ${T.borderStrong}`, display: "block", objectFit: "cover", maxHeight: 220, cursor: "zoom-in" }}
                            onError={e => { e.currentTarget.style.display = "none"; }}
                          />
                        </a>
                      </div>
                    )}
                    {rawUrl && (
                      <div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>🗂️ Raw screenshot</div>
                        <a href={rawUrl} target="_blank" rel="noreferrer">
                          <img
                            src={rawUrl}
                            alt="Raw screenshot"
                            style={{ width: "100%", borderRadius: 8, border: `1px solid ${T.borderStrong}`, display: "block", objectFit: "cover", maxHeight: 220, cursor: "zoom-in" }}
                            onError={e => { e.currentTarget.style.display = "none"; }}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── No screenshot fallback ── */}
              {!ssUrl && !rawUrl && (
                <div style={{ padding: "14px", borderRadius: 8, border: `1px dashed ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>No screenshots uploaded yet</div>
                </div>
              )}

              {/* Cred link */}
              {item.credibilityLink && (
                <div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Credibility link</div>
                  <a href={item.credibilityLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.blue, wordBreak: "break-all" }}>{item.credibilityLink}</a>
                </div>
              )}
            </div>
          )}

          {/* ════ EDIT MODE ════ */}
          {isEditing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={sectionLabel}>Feedback</div>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                  style={{ ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Project title">
                  <input style={inputStyle} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
                </Field>
                <Field label="Contract title">
                  <input style={inputStyle} value={contractTitle} onChange={e => setContractTitle(e.target.value)} />
                </Field>
                <Field label="Category">
                  <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">— select —</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Credibility link">
                  <input style={inputStyle} type="url" value={credLink} onChange={e => setCredLink(e.target.value)} placeholder="https://…" />
                </Field>
              </div>

              <div>
                <div style={sectionLabel}>Rating</div>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div>
                <div style={sectionLabel}>Status</div>
                <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="rgba(245,158,11,0.12)" />
              </div>

              <div>
                <div style={sectionLabel}>Tools used</div>
                <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} />
              </div>

              {/* ── Screenshots ── */}
              <div>
                <div style={sectionLabel}>Screenshots</div>

                {/* Feedback Screenshot */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: T.textSecond, marginBottom: 6 }}>📸 Feedback Screenshot</div>

                  {item.feedbackScreenshot && !deleteFeedbackSs && !screenshotFile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <img
                        src={item.feedbackScreenshot}
                        alt="Current feedback screenshot"
                        style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderStrong}` }}
                      />
                      <span style={{ fontSize: 11, color: T.textMuted }}>Current</span>
                      <button
                        onClick={() => setDeleteFeedbackSs(true)}
                        style={{ fontSize: 11, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit" }}>
                        🗑️ Remove
                      </button>
                    </div>
                  )}

                  {deleteFeedbackSs && !screenshotFile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#f87171" }}>⚠ Will be removed on save</span>
                      <button
                        onClick={() => setDeleteFeedbackSs(false)}
                        style={{ fontSize: 11, color: T.textSecond, background: "none", border: `1px solid ${T.borderStrong}`, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit" }}>
                        Undo
                      </button>
                    </div>
                  )}

                  <UploadZone
                    label="Upload new feedback screenshot"
                    hint="Replaces current · JPG PNG WEBP"
                    emoji="📸"
                    preview={screenshotPreview}
                    onChange={f => {
                      setScreenshotFile(f);
                      setScreenshotPreview(f ? URL.createObjectURL(f) : null);
                      if (f) setDeleteFeedbackSs(false);
                    }}
                  />
                  {screenshotFile && (
                    <button
                      onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                      style={{ marginTop: 4, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                      × Clear new upload
                    </button>
                  )}
                </div>

                {/* Raw Screenshot */}
                <div>
                  <div style={{ fontSize: 11, color: T.textSecond, marginBottom: 6 }}>🗂️ Raw Screenshot</div>

                  {item.rawScreenshot && !deleteRawSs && !rawFile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <img
                        src={item.rawScreenshot}
                        alt="Current raw screenshot"
                        style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderStrong}` }}
                      />
                      <span style={{ fontSize: 11, color: T.textMuted }}>Current</span>
                      <button
                        onClick={() => setDeleteRawSs(true)}
                        style={{ fontSize: 11, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit" }}>
                        🗑️ Remove
                      </button>
                    </div>
                  )}

                  {deleteRawSs && !rawFile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#f87171" }}>⚠ Will be removed on save</span>
                      <button
                        onClick={() => setDeleteRawSs(false)}
                        style={{ fontSize: 11, color: T.textSecond, background: "none", border: `1px solid ${T.borderStrong}`, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit" }}>
                        Undo
                      </button>
                    </div>
                  )}

                  <UploadZone
                    label="Upload new raw screenshot"
                    hint="Original unedited · JPG PNG WEBP"
                    emoji="🗂️"
                    preview={rawPreview}
                    onChange={f => {
                      setRawFile(f);
                      setRawPreview(f ? URL.createObjectURL(f) : null);
                      if (f) setDeleteRawSs(false);
                    }}
                  />
                  {rawFile && (
                    <button
                      onClick={() => { setRawFile(null); setRawPreview(null); }}
                      style={{ marginTop: 4, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                      × Clear new upload
                    </button>
                  )}
                </div>
              </div>

              {editResult && (
                <div style={{ padding: "8px 12px", borderRadius: 7, fontSize: 12,
                  background: editResult.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color:      editResult.type === "success" ? "#4ade80"              : "#f87171",
                  border: `1px solid ${editResult.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {editResult.msg}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                <button onClick={() => setIsEditing(false)}
                  style={{ padding: "8px 16px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={editSubmitting}
                  style={{ padding: "8px 20px", fontSize: 12, border: "none", borderRadius: 7, background: editSubmitting ? "#4b5563" : T.blue, color: "#fff", cursor: editSubmitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                  {editSubmitting ? "⏳ Saving…" : "💾 Save changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SS Thumb helper ───────────────────────────────────────────────────────────
function SsThumb({ url, label }) {
  const resolved = resolveScreenshot(url);
  if (!resolved) return <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>;
  return (
    <a href={resolved} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
      title={label}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 26, borderRadius: 4, background: T.blueDim, border: `1px solid ${T.borderStrong}`, fontSize: 9, color: "#7eb3fa", textDecoration: "none", cursor: "pointer" }}>
      📷
    </a>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function TestimonialsDashboard() {
  const [clients, setClients]               = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError]     = useState(null);
  const [testimonials, setTestimonials]     = useState([]);
  const [tableLoading, setTableLoading]     = useState(false);
  const [tableError, setTableError]         = useState(null);

  const [showCreate, setShowCreate]         = useState(false);
  const [createResult, setCreateResult]     = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  const [editResult, setEditResult]         = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const [viewItem, setViewItem]             = useState(null);

  useEffect(() => { fetchClients(); fetchTestimonials(); }, []);

  async function fetchClients() {
    setClientsLoading(true); setClientsError(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/clients`, { headers: { "Content-Type": "application/json", "x-api-key": API_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load clients");
      setClients(Array.isArray(json.data) ? json.data : []);
    } catch (err) { setClientsError(err.message); setClients([]); }
    finally { setClientsLoading(false); }
  }

  async function fetchTestimonials() {
    setTableLoading(true); setTableError(null);
    try {
      const res  = await fetch(`${BASE_URL}/api/testimonials`, { headers: { "Content-Type": "application/json", "x-api-key": API_KEY_GET } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTestimonials(Array.isArray(json) ? json : json.data || []);
    } catch (err) { setTableError(err.message); }
    finally { setTableLoading(false); }
  }

  async function uploadFile(file) {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch(`${BASE_URL}/admin/upload`, { method: "POST", headers: { "x-api-key": API_KEY }, body: fd });
    if (!res.ok) throw new Error("Upload failed: " + await res.text());
    return (await res.json()).fileId;
  }

  async function handleCreate({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, selectedClient, screenshotFile, rawFile }) {
    setCreateResult(null);
    if (!feedback.trim()) return setCreateResult({ type: "error", msg: "Feedback text is required." });
    if (!selectedClient)  return setCreateResult({ type: "error", msg: "Please select a client." });
    setSubmitting(true);
    try {
      let screenshotFileId = null, rawFileId = null;
      if (screenshotFile) screenshotFileId = await uploadFile(screenshotFile);
      if (rawFile)        rawFileId        = await uploadFile(rawFile);
      const payload = {
        feedback: feedback.trim(), clientId: selectedClient.id,
        ...(contractTitle    && { contractTitle:   contractTitle.trim()   }),
        ...(projectTitle     && { projectTitle:    projectTitle.trim()    }),
        ...(category         && { category                                }),
        ...(credLink         && { credibilityLink: credLink.trim()        }),
        ...(rating           && { rate:            rating                 }),
        ...(status           && { status                                  }),
        ...(tools.size       && { tools:           [...tools]             }),
        ...(screenshotFileId && { screenshotFileId                        }),
        ...(rawFileId        && { rawFileId                               }),
      };
      const res  = await fetch(`${BASE_URL}/admin/testimonials`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCreateResult({ type: "success", msg: `✓ Created! Notion ID: ${data.id}` });
      setTimeout(() => { setShowCreate(false); setCreateResult(null); }, 1400);
      fetchTestimonials();
    } catch (err) { setCreateResult({ type: "error", msg: err.message }); }
    finally { setSubmitting(false); }
  }

  async function handleEdit(id, { feedback, contractTitle, projectTitle, category, credLink, rating, status, tools }) {
    setEditResult(null); setEditSubmitting(true);
    try {
      const payload = {
        feedback: feedback.trim(),
        ...(contractTitle && { contractTitle: contractTitle.trim() }),
        ...(projectTitle  && { projectTitle:  projectTitle.trim()  }),
        ...(category      && { category                            }),
        ...(credLink      && { credibilityLink: credLink.trim()    }),
        rate: rating || 0,
        ...(status        && { status                              }),
        tools: [...tools],
      };
      const res  = await fetch(`${BASE_URL}/admin/testimonials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setEditResult({ type: "success", msg: "✓ Saved!" });
      setTimeout(() => {
        setEditResult(null);
        setViewItem(null); // close modal after save
        fetchTestimonials();
      }, 900);
    } catch (err) { setEditResult({ type: "error", msg: err.message }); }
    finally { setEditSubmitting(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/delete/${deleteTarget.id}`, { method: "DELETE", headers: { "x-api-key": API_KEY } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed."); }
      setDeleteTarget(null);
      fetchTestimonials();
    } catch (err) { alert("Delete failed: " + err.message); }
    finally { setDeleteLoading(false); }
  }

  // 15 columns — last col no longer needs action button space
  const COL_COUNT = 15;

  const COLS = [
    { key: "feedback",          label: "Feedback",          w: 200 },
    { key: "status",            label: "Status",            w: 142 },
    { key: "contractTitle",     label: "Contract Title",    w: 170 },
    { key: "company",           label: "Company",           w: 130 },
    { key: "displayName",       label: "Display Name",      w: 115 },
    { key: "projectTitle",      label: "Project Title",     w: 175 },
    { key: "client",            label: "Client",            w: 155 },
    { key: "clientProfile",     label: "Client Profile",    w: 110 },
    { key: "reviewerRole",      label: "Reviewer Role",     w: 130 },
    { key: "tools",             label: "Tools",             w: 165 },
    { key: "rawScreenshot",     label: "Raw SS",            w: 72  },
    { key: "feedbackScreenshot",label: "Feedback SS",       w: 88  },
    { key: "credibilityLink",   label: "Credibility Link",  w: 150 },
    { key: "category",          label: "Category",          w: 152 },
    { key: "rate",              label: "Rating",            w: 90  },
  ];

  const thStyle = (w) => ({
    padding: "10px 12px", fontWeight: 500, fontSize: 10, color: T.textMuted,
    textAlign: "left", textTransform: "uppercase", letterSpacing: "0.06em",
    whiteSpace: "nowrap", width: w, minWidth: w,
    borderRight: `1px solid rgba(59,130,246,0.1)`,
  });

  const tdBase = (w, extra = {}) => ({
    padding: "10px 12px", verticalAlign: "middle",
    width: w, minWidth: w, maxWidth: w,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    borderRight: `1px solid rgba(59,130,246,0.07)`,
    ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: T.navy, padding: "2rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {showCreate && (
        <Modal title="⭐ Add testimonial" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
          <TestimonialForm mode="create" initial={{}} clients={clients} clientsLoading={clientsLoading} clientsError={clientsError} onRetryClients={fetchClients} onSubmit={handleCreate} onCancel={() => { setShowCreate(false); setCreateResult(null); }} submitting={submitting} result={createResult} />
        </Modal>
      )}

      {showProperties && <PropertiesModal onClose={() => setShowProperties(false)} />}

      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => { setViewItem(null); setEditResult(null); }}
          onDelete={(item) => setDeleteTarget(item)}
          onSave={handleEdit}
          editSubmitting={editSubmitting}
          editResult={editResult}
        />
      )}

      {/* ── Table container ── */}
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", background: T.navyCard, borderRadius: 16, border: `1px solid ${T.borderStrong}`, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: `1px solid ${T.border}`, background: T.navyDeep }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.blue, margin: 0 }}>📋 Testimonials</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: "3px 0 0" }}>
              {testimonials.length} record{testimonials.length !== 1 ? "s" : ""} · synced from Notion
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowProperties(true)}
              style={{ padding: "7px 12px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 8, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
              🗂️ Properties
            </button>
            <button onClick={fetchTestimonials} disabled={tableLoading}
              style={{ padding: "7px 14px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 8, background: T.blueDim, color: T.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
              {tableLoading ? "↻ Refreshing…" : "🔄 Refresh"}
            </button>
            <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
              style={{ padding: "7px 16px", fontSize: 12, border: "none", borderRadius: 8, background: T.blue, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              + Create
            </button>
          </div>
        </div>

        {tableError && (
          <div style={{ padding: "10px 22px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13, margin: "12px 22px", borderRadius: 8 }}>
            ⚠ {tableError}
          </div>
        )}

        {/* Horizontally scrollable table */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed", width: COLS.reduce((s, c) => s + c.w, 0) }}>
            <thead>
              <tr style={{ background: T.navyDeep, borderBottom: `1px solid ${T.borderStrong}` }}>
                {COLS.map((col, i) => (
                  <th key={col.key} style={{ ...thStyle(col.w), borderRight: i < COLS.length - 1 ? `1px solid rgba(59,130,246,0.1)` : "none" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableLoading && testimonials.length === 0 ? (
                <tr><td colSpan={COL_COUNT} style={{ padding: 32, textAlign: "center", color: T.textMuted }}>Fetching records…</td></tr>
              ) : testimonials.length === 0 ? (
                <tr><td colSpan={COL_COUNT} style={{ padding: 32, textAlign: "center", color: T.textMuted }}>No testimonials yet. Click <strong style={{ color: T.blue }}>+ Create</strong> to add one.</td></tr>
              ) : (
                testimonials.map((item, index) => {
                  const ss   = statusStyle(item.status);
                  const cs   = categoryStyle(item.category);
                  const role = resolveRole(item);
                  // Screenshots strictly from screenshot fields
                  // ✅ NEW
                  const ssUrl  = resolveScreenshot(item.feedbackScreenshot);
                  const rawUrl = resolveScreenshot(item.rawScreenshot);

                  return (
                    <tr key={item.id || index}
                      onClick={() => setViewItem(item)}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        background: index % 2 === 0 ? T.navyRow : T.navyRowAlt,
                        transition: "background 0.1s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? T.navyRow : T.navyRowAlt; }}
                    >
                      {/* 1. Feedback */}
                      <td style={tdBase(COLS[0].w)} title={item.feedback}>
                        <span style={{ color: T.textSecond, fontSize: 11 }}>{item.feedback || "—"}</span>
                      </td>

                      {/* 2. Status */}
                      <td style={tdBase(COLS[1].w)}>
                        {item.status
                          ? <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, whiteSpace: "nowrap" }}>{item.status}</span>
                          : <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>}
                      </td>

                      {/* 3. Contract Title */}
                      <td style={tdBase(COLS[2].w)} title={item.contractTitle}>
                        <span style={{ color: T.textPrimary, fontWeight: 500, fontSize: 12 }}>{item.contractTitle || "—"}</span>
                      </td>

                      {/* 4. Company */}
                      <td style={tdBase(COLS[3].w)} title={item.company}>
                        <span style={{ color: T.textSecond }}>{item.company || "—"}</span>
                      </td>

                      {/* 5. Display Name */}
                      <td style={tdBase(COLS[4].w)}>
                        <span style={{ color: T.textPrimary, fontWeight: 500 }}>{item.displayName || "—"}</span>
                      </td>

                      {/* 6. Project Title */}
                      <td style={tdBase(COLS[5].w)} title={item.projectTitle}>
                        <span style={{ color: T.textSecond, fontSize: 11 }}>{item.projectTitle || "—"}</span>
                      </td>

                      {/* 7. Client */}
                      <td style={tdBase(COLS[6].w)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                          <Avatar name={item.displayName || "?"} src={resolveImageUrl(item)} size={24} />
                          <span style={{ fontWeight: 500, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
                            {item.displayName || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* 8. Client Profile */}
                      <td style={tdBase(COLS[7].w)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar name={item.displayName || "?"} src={resolveImageUrl(item)} size={22} />
                          <span style={{ fontSize: 11, color: T.textMuted }}>{item.displayName?.split(" ")?.[0] || "—"}</span>
                        </div>
                      </td>

                      {/* 9. Reviewer Role — now resolved from formula */}
                      <td style={tdBase(COLS[8].w)} title={role}>
                        <span style={{ fontSize: 11, color: T.textSecond }}>{role || "—"}</span>
                      </td>

                      {/* 10. Tools */}
                      <td style={{ ...tdBase(COLS[9].w), whiteSpace: "normal" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                          {item.tools?.length > 0
                            ? item.tools.slice(0, 3).map(t => (
                                <span key={t} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: T.blueDim, color: "#7eb3fa", border: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{t}</span>
                              ))
                            : <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>
                          }
                          {item.tools?.length > 3 && <span style={{ fontSize: 9, color: T.textMuted }}>+{item.tools.length - 3}</span>}
                        </div>
                      </td>

                      {/* 11. Raw Screenshot */}
                      <td style={{ ...tdBase(COLS[10].w), textAlign: "center" }}>
                        <SsThumb url={rawUrl} label="Raw screenshot" />
                      </td>

                      {/* 12. Feedback Screenshot */}
                      <td style={{ ...tdBase(COLS[11].w), textAlign: "center" }}>
                        <SsThumb url={ssUrl} label="Feedback screenshot" />
                      </td>

                      {/* 13. Credibility Link */}
                      <td style={tdBase(COLS[12].w)} title={item.credibilityLink}>
                        {item.credibilityLink
                          ? <a href={item.credibilityLink} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize: 11, color: T.blue, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                              {item.credibilityLink.replace(/^https?:\/\//, "")}
                            </a>
                          : <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>}
                      </td>

                      {/* 14. Category */}
                      <td style={tdBase(COLS[13].w)}>
                        {item.category
                          ? <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color, whiteSpace: "nowrap" }}>{item.category}</span>
                          : <span style={{ color: T.textMuted, fontStyle: "italic", fontSize: 11 }}>—</span>}
                      </td>

                      {/* 15. Rating — clean, no buttons */}
                      <td style={{ ...tdBase(COLS[14].w), borderRight: "none" }}>
                        <div style={{ display: "flex", gap: 1 }}>
                          {[1,2,3,4,5].map(n => (
                            <span key={n} style={{ fontSize: 11, color: n <= (item.rate || 0) ? "#f59e0b" : "#1e3a6e" }}>★</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "9px 22px", fontSize: 11, color: T.textMuted, textAlign: "right", borderTop: `1px solid ${T.border}`, background: T.navyDeep }}>
          Showing {testimonials.length} row{testimonials.length !== 1 ? "s" : ""} · {COL_COUNT} columns · click any row to view details
        </div>
      </div>
    </div>
  );
}