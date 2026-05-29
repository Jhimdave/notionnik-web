import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL   = import.meta.env.VITE_API_URL;
const ADMIN_KEY  = import.meta.env.VITE_API_CLIENT_KEY;  // /admin/* routes
const PUBLIC_KEY = import.meta.env.VITE_API_SECRET;      // /api/* routes

// ── Theme (matches TestimonialsDashboard) ─────────────────────────
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
  green:       "#4ade80",
  greenDim:    "rgba(34,197,94,0.12)",
  greenBorder: "rgba(34,197,94,0.3)",
};

// ── Known tools / tags for pill selectors ─────────────────────────
const TOOLS_OPTIONS = [
  "Notion","Notion API","Automation","Zapier","Make","Airtable",
  "Go High Level","Google App Script","CRM","Slack","React",
  "TailwindCSS","Framer","Webflow","TypeScript","Node.js",
];
const FEATURES_OPTIONS = [
  "Custom database architecture","Linked databases & relations",
  "Filtered views per team role","Template systems",
  "Automated workflows","API integration","Real-time sync",
  "Custom dashboard","Onboarding flow","Reporting & analytics",
  "Multi-workspace setup","Permission management",
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

// ── Status badge colours ──────────────────────────────────────────
const STATUS_COLORS = {
  "Open":       { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80" },
  "Coming Soon":{ bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
  "Closed":     { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   color:"#f87171" },
  "Draft":      { bg:"rgba(100,116,139,0.12)",border:"rgba(100,116,139,0.3)", color:"#94a3b8" },
};
function statusStyle(s) {
  return STATUS_COLORS[s] || { bg:"rgba(100,116,139,0.12)", border:"rgba(100,116,139,0.3)", color:"#94a3b8" };
}

// ── Shared style helpers ──────────────────────────────────────────
const inputStyle = {
  width:"100%", fontSize:13, padding:"7px 10px",
  border:`1px solid ${T.borderStrong}`, borderRadius:7,
  background:T.navyDeep, color:T.textPrimary, outline:"none",
  boxSizing:"border-box", fontFamily:"inherit",
};
const sectionLabel = {
  fontSize:10, fontWeight:700, color:T.textMuted,
  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8,
};
const divider = { height:1, background:T.border, margin:"16px 0" };

// ── Helpers: extract values from raw Notion page properties ───────
function extractTitle(prop) {
  return prop?.title?.map(t => t.plain_text).join("") || "";
}
function extractRichText(prop) {
  return prop?.rich_text?.map(t => t.plain_text).join("") || "";
}
function extractSelect(prop) {
  return prop?.select?.name || "";
}
function extractMultiSelect(prop) {
  return prop?.multi_select?.map(o => o.name) || [];
}
function extractStatus(prop) {
  return prop?.status?.name || "";
}
function extractUrl(prop) {
  return prop?.url || "";
}
function extractNumber(prop) {
  return prop?.number ?? null;
}
function extractCheckbox(prop) {
  return prop?.checkbox ?? false;
}
function extractFiles(prop) {
  return prop?.files?.map(f =>
    f.type === "external" ? f.external?.url : f.file?.url
  ).filter(Boolean) || [];
}
function extractDate(prop) {
  return prop?.date?.start || "";
}

// ── Generic property value extractor — used for dynamic columns ───
function extractAnyProp(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case "title":        return extractTitle(prop);
    case "rich_text":    return extractRichText(prop);
    case "select":       return extractSelect(prop);
    case "multi_select": return extractMultiSelect(prop);
    case "status":       return extractStatus(prop);
    case "url":          return extractUrl(prop);
    case "number":       return extractNumber(prop);
    case "checkbox":     return extractCheckbox(prop);
    case "files":        return extractFiles(prop);
    case "date":         return extractDate(prop);
    default:             return null;
  }
}

// ── Normalise a raw Notion page → flat service object ─────────────
function normalisePage(page) {
  const p = page.properties || {};
  return {
    id:                 page.id,
    url:                page.url,
    _raw:               p,
    title:              extractTitle(p["Title"]),
    serviceHeader:      extractRichText(p["Service Header"]),
    serviceDescription: extractRichText(p["Service Description"]),
    tools:              extractMultiSelect(p["Tools"]),
    features:           extractMultiSelect(p["Features"]),
    status:             extractStatus(p["Status"]) || extractSelect(p["Status"]),
    logo:               extractFiles(p["Logo"])[0] || null,
  };
}

// ── Render a cell value for any property type ─────────────────────
function DynamicCell({ value, type }) {
  if (value === null || value === undefined || value === "") {
    return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
  }
  if (type === "checkbox") {
    return <span style={{ fontSize:13 }}>{value ? "✅" : "☐"}</span>;
  }
  if (type === "multi_select" && Array.isArray(value)) {
    if (!value.length) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
    return (
      <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
        {value.slice(0,3).map(v => (
          <span key={v} style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:T.blueDim, color:"#7eb3fa", border:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{v}</span>
        ))}
        {value.length > 3 && <span style={{ fontSize:9, color:T.textMuted }}>+{value.length-3}</span>}
      </div>
    );
  }
  if (type === "select" || type === "status") {
    const ss = statusStyle(value);
    return (
      <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:500, background:ss.bg, border:`1px solid ${ss.border}`, color:ss.color, whiteSpace:"nowrap" }}>
        {value}
      </span>
    );
  }
  if (type === "url") {
    return (
      <a href={value} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        style={{ fontSize:11, color:T.blue, textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", display:"block" }}>
        {value.replace(/^https?:\/\//, "")}
      </a>
    );
  }
  if (type === "files" && Array.isArray(value)) {
    if (!value.length) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
    return (
      <a href={value[0]} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
        style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:38, height:26, borderRadius:4, background:T.blueDim, border:`1px solid ${T.borderStrong}`, fontSize:9, color:"#7eb3fa", textDecoration:"none" }}>
        📎
      </a>
    );
  }
  if (type === "number") {
    return <span style={{ color:T.textPrimary, fontWeight:500, fontSize:12 }}>{value}</span>;
  }
  return <span style={{ color:T.textSecond, fontSize:11 }}>{String(value)}</span>;
}

// ── Shared UI primitives ──────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:12, color:T.textSecond, display:"block", marginBottom:4, fontWeight:500 }}>
        {label}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{hint}</p>}
    </div>
  );
}

function PillToggle({ options, selected, onToggle, activeColor=T.blue, activeBg=T.blueDim }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding:"4px 11px", borderRadius:20, fontSize:12, cursor:"pointer",
            border:"1px solid", fontFamily:"inherit",
            borderColor: active ? activeColor   : T.borderStrong,
            background:  active ? activeBg      : "transparent",
            color:       active ? activeColor   : T.textSecond,
            fontWeight:  active ? 500 : 400, transition:"all 0.15s",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function UploadZone({ label, hint, emoji, preview, onChange }) {
  const ref = useRef();
  function handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB."); ref.current.value = ""; return; }
    onChange(file);
  }
  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        border:`1.5px dashed ${T.borderStrong}`, borderRadius:9, padding:"14px 10px",
        textAlign:"center", cursor:"pointer", background:T.navyDeep,
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.borderStrong}
      >
        <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize:22, marginBottom:4 }}>{emoji}</div>
        <p style={{ fontSize:12, color:T.textPrimary, fontWeight:500, margin:0 }}>{label}</p>
        <p style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{hint} · Max 5 MB</p>
      </div>
      {preview && <img src={preview} alt="preview" style={{ width:"100%", height:80, objectFit:"contain", borderRadius:7, marginTop:6, border:`1px solid ${T.borderStrong}`, background:"rgba(0,0,0,0.3)" }} />}
    </div>
  );
}

function AlertBox({ result }) {
  if (!result) return null;
  const ok = result.type === "success";
  return (
    <div style={{
      padding:"9px 12px", borderRadius:7, fontSize:12, marginBottom:10,
      background: ok ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
      color:      ok ? "#4ade80"               : "#f87171",
      border:`1px solid ${ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
    }}>{result.msg}</div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={onCancel} style={{ position:"absolute", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(2px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid ${T.borderStrong}`, borderRadius:14, padding:"28px 28px 24px", width:380, zIndex:1 }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontSize:16, fontWeight:600, color:T.textPrimary, textAlign:"center", margin:"0 0 8px" }}>Delete service?</h3>
        <p style={{ fontSize:13, color:T.textSecond, textAlign:"center", margin:"0 0 20px", lineHeight:1.5 }}>
          This will permanently remove <strong style={{ color:T.textPrimary }}>{item?.title || "this service"}</strong>. This cannot be undone.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"9px 0", border:`1px solid ${T.borderStrong}`, borderRadius:8, background:"transparent", color:T.textSecond, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:"9px 0", border:"none", borderRadius:8, background:loading?"#4b5563":"#dc2626", color:"#fff", cursor:loading?"not-allowed":"pointer", fontSize:13, fontWeight:500, fontFamily:"inherit" }}>
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Properties Modal — add / remove DB columns ────────────────────
function PropertiesModal({ onClose, onPropsChanged }) {
  const [tab, setTab]             = useState("add");
  const [props, setProps]         = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsError, setPropsError]     = useState(null);
  const [newName, setNewName]     = useState("");
  const [newType, setNewType]     = useState("rich_text");
  const [options, setOptions]     = useState([{ name:"", color:"default" }]);
  const [adding, setAdding]       = useState(false);
  const [addResult, setAddResult] = useState(null);
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
      const res  = await fetch(`${BASE_URL}/admin/services/db-properties`, { headers:{ "x-api-key": ADMIN_KEY } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProps(data.data);
    } catch(err) { setPropsError(err.message); }
    finally { setPropsLoading(false); }
  }

  function addOption() { setOptions(prev => [...prev, { name:"", color:"default" }]); }
  function removeOption(i) { setOptions(prev => prev.filter((_,idx) => idx !== i)); }
  function updateOption(i, key, val) { setOptions(prev => prev.map((o,idx) => idx===i ? {...o,[key]:val} : o)); }

  async function handleAdd() {
    if (!newName.trim()) return setAddResult({ type:"error", msg:"Property name is required." });
    setAdding(true); setAddResult(null);
    try {
      const body = { name:newName.trim(), type:newType };
      if (needsOptions) body.options = options.filter(o => o.name.trim()).map(o => ({ name:o.name.trim(), color:o.color }));
      const res  = await fetch(`${BASE_URL}/admin/services/new-property`, { method:"POST", headers:{ "Content-Type":"application/json","x-api-key":ADMIN_KEY }, body:JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAddResult({ type:"success", msg:`✓ "${newName.trim()}" added! Refresh the table to see it.` });
      setNewName(""); setNewType("rich_text"); setOptions([{ name:"", color:"default" }]);
      fetchProps();
      onPropsChanged?.();
    } catch(err) { setAddResult({ type:"error", msg:err.message }); }
    finally { setAdding(false); }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete property "${name}"? This removes the column from every row.`)) return;
    setDeletingName(name); setDeleteResult(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/services/property`, { method:"DELETE", headers:{ "Content-Type":"application/json","x-api-key":ADMIN_KEY }, body:JSON.stringify({ name }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDeleteResult({ type:"success", msg:`✓ "${name}" deleted.` });
      fetchProps();
      onPropsChanged?.();
    } catch(err) { setDeleteResult({ type:"error", msg:err.message }); }
    finally { setDeletingName(null); }
  }

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{
      padding:"7px 16px", fontSize:12, borderRadius:7, cursor:"pointer", border:"none",
      fontFamily:"inherit", fontWeight: tab===id ? 600 : 400,
      background: tab===id ? T.blue  : T.navyRow,
      color:      tab===id ? "#fff"  : T.textSecond,
      display:"flex", alignItems:"center", gap:5,
    }}>{icon} {label}</button>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid ${T.borderStrong}`, borderRadius:16, width:"100%", maxWidth:520, zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 14px", borderBottom:`1px solid ${T.border}`, background:T.navyDeep, borderRadius:"16px 16px 0 0" }}>
          <div>
            <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:T.textPrimary }}>🗂️ Manage DB Properties</h2>
            <p style={{ margin:"3px 0 0", fontSize:11, color:T.textMuted }}>Add or remove columns · changes appear as new table columns</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, padding:4 }}>×</button>
        </div>
        <div style={{ display:"flex", gap:6, padding:"14px 24px 0" }}>
          {tabBtn("add", "Add Property", "＋")}
          {tabBtn("remove", "Remove Property", "🗑")}
        </div>
        <div style={{ padding:"16px 24px 24px" }}>

          {/* ── ADD TAB ── */}
          {tab === "add" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Field label="Property name" required>
                <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Delivery Time, Budget, Notes…" />
              </Field>
              <Field label="Property type" required>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.value} onClick={() => setNewType(t.value)} style={{
                      padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                      border:"1px solid", fontFamily:"inherit",
                      borderColor: newType===t.value ? T.blue         : T.borderStrong,
                      background:  newType===t.value ? T.blueDim      : "transparent",
                      color:       newType===t.value ? T.blue         : T.textSecond,
                      fontWeight:  newType===t.value ? 500 : 400,
                    }}>{t.label}</button>
                  ))}
                </div>
              </Field>
              {needsOptions && (
                <div>
                  <div style={sectionLabel}>Options</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {options.map((opt,i) => (
                      <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <select value={opt.color} onChange={e => updateOption(i,"color",e.target.value)}
                          style={{ ...inputStyle, width:32, height:32, padding:0, textAlign:"center", background:COLOR_DOTS[opt.color], color:"transparent", cursor:"pointer", borderRadius:6 }}>
                          {NOTION_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input style={{ ...inputStyle, flex:1 }} value={opt.name} onChange={e => updateOption(i,"name",e.target.value)} placeholder={`Option ${i+1}…`} />
                        {options.length > 1 && (
                          <button onClick={() => removeOption(i)} style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:16, padding:"0 4px" }}>×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={addOption} style={{ alignSelf:"flex-start", fontSize:11, color:T.blue, background:"none", border:`1px dashed ${T.borderStrong}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>+ Add option</button>
                  </div>
                </div>
              )}
              <AlertBox result={addResult} />
              <button onClick={handleAdd} disabled={adding} style={{ padding:"9px 0", fontSize:13, border:"none", borderRadius:8, background:adding?"#4b5563":T.blue, color:"#fff", cursor:adding?"not-allowed":"pointer", fontWeight:500, fontFamily:"inherit" }}>
                {adding ? "⏳ Adding…" : "＋ Add property"}
              </button>
            </div>
          )}

          {/* ── REMOVE TAB ── */}
          {tab === "remove" && (
            <div>
              <AlertBox result={deleteResult} />
              {propsLoading && <p style={{ fontSize:12, color:T.textMuted, textAlign:"center", padding:"20px 0" }}>Loading properties…</p>}
              {propsError   && <p style={{ fontSize:12, color:"#f87171" }}>⚠ {propsError}</p>}
              {!propsLoading && props.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:360, overflowY:"auto" }}>
                  {props.map(p => (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.navyRow }}>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:T.textPrimary }}>{p.name}</span>
                        <span style={{ marginLeft:8, fontSize:10, color:T.textMuted, background:T.navyDeep, padding:"1px 6px", borderRadius:4 }}>{p.type}</span>
                        {p.options?.length > 0 && (
                          <span style={{ marginLeft:6, fontSize:10, color:T.textMuted }}>({p.options.length} options)</span>
                        )}
                      </div>
                      {p.type === "title" ? (
                        <span style={{ fontSize:10, color:T.textMuted, fontStyle:"italic" }}>protected</span>
                      ) : (
                        <button onClick={() => handleDelete(p.name)} disabled={deletingName===p.name}
                          style={{ padding:"4px 10px", fontSize:11, border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, background:"transparent", color:"#f87171", cursor:deletingName===p.name?"not-allowed":"pointer", fontFamily:"inherit", opacity:deletingName===p.name?0.5:1 }}>
                          {deletingName===p.name ? "…" : "🗑️ Delete"}
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

// ── Service Form — create & edit ──────────────────────────────────
function ServiceForm({ mode="create", initial={}, onSubmit, onCancel, submitting, result }) {
  const [title, setTitle]                    = useState(initial.title              || "");
  const [serviceHeader, setServiceHeader]    = useState(initial.serviceHeader      || "");
  const [serviceDescription, setServiceDesc] = useState(initial.serviceDescription || "");
  const [tools, setTools]                    = useState(new Set(initial.tools      || []));
  const [features, setFeatures]              = useState(new Set(initial.features   || []));
  const [logoFile, setLogoFile]              = useState(null);
  const [logoPreview, setLogoPreview]        = useState(null);
  const isEdit = mode === "edit";

  function toggleTool(t)    { setTools(prev    => { const n=new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function toggleFeature(f) { setFeatures(prev => { const n=new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; }); }

  function handleSubmit() {
    onSubmit({ title, serviceHeader, serviceDescription, tools, features, logoFile });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* Core fields */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Service details</div>
        <Field label="Title" required>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Notion Workspaces" />
        </Field>
        <Field label="Service Header" hint="Short tagline shown in cards">
          <input style={inputStyle} value={serviceHeader} onChange={e => setServiceHeader(e.target.value)} placeholder="e.g. Your entire business, beautifully organized in Notion." />
        </Field>
        <Field label="Service Description" hint="Longer description">
          <textarea value={serviceDescription} onChange={e => setServiceDesc(e.target.value)}
            style={{ ...inputStyle, minHeight:100, resize:"vertical", lineHeight:1.6 }}
            placeholder="We design and build customized Notion systems that…" />
        </Field>
      </div>

      <div style={divider} />

      {/* Tools */}
      <div style={{ marginBottom:14 }}>
        <div style={sectionLabel}>Tools</div>
        <PillToggle options={TOOLS_OPTIONS} selected={[...tools]} onToggle={toggleTool} />
      </div>

      {/* Features */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Features</div>
        <PillToggle options={FEATURES_OPTIONS} selected={[...features]} onToggle={toggleFeature} activeColor="#a78bfa" activeBg="rgba(167,139,250,0.1)" />
      </div>

      <div style={divider} />

      {/* Logo upload */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Logo / Icon</div>
        <UploadZone
          label="Upload service logo"
          hint="PNG WEBP SVG · transparent background ideal"
          emoji="🖼️"
          preview={logoPreview}
          onChange={f => { setLogoFile(f); setLogoPreview(f ? URL.createObjectURL(f) : null); }}
        />
        {logoFile && (
          <button onClick={() => { setLogoFile(null); setLogoPreview(null); }}
            style={{ marginTop:4, fontSize:11, color:T.textMuted, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>
            × Clear
          </button>
        )}
      </div>

      <AlertBox result={result} />

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
        <button onClick={onCancel} style={{ padding:"8px 16px", fontSize:12, border:`1px solid ${T.borderStrong}`, borderRadius:7, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting} style={{ padding:"8px 20px", fontSize:12, border:"none", borderRadius:7, background:submitting?"#4b5563":T.blue, color:"#fff", cursor:submitting?"not-allowed":"pointer", fontWeight:500, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
          {submitting ? "⏳ Saving…" : isEdit ? "💾 Save changes" : "🚀 Create service"}
        </button>
      </div>
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid ${T.borderStrong}`, borderRadius:16, width:"100%", maxWidth:700, zIndex:1, animation:"modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}`, background:T.navyDeep, borderRadius:"16px 16px 0 0" }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:600, color:T.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, padding:4 }}>×</button>
        </div>
        <div style={{ padding:"20px 24px 24px", overflowY:"auto", maxHeight:"calc(90vh - 70px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── View / Edit Modal ─────────────────────────────────────────────
function ViewModal({ item, dbProps, onClose, onDelete, onSave, editSubmitting, editResult }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const ss = statusStyle(item.status);

  const CORE = new Set(["Title","Service Header","Service Description","Logo","Tools","Features","Status"]);
  const extraProps = dbProps.filter(p => !CORE.has(p.name) && p.type !== "title");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid ${T.borderStrong}`, borderRadius:16, width:"100%", maxWidth:600, zIndex:1, animation:"modalIn 0.2s ease", maxHeight:"92vh", display:"flex", flexDirection:"column" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>

        {/* Sticky header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${T.border}`, background:T.navyDeep, borderRadius:"16px 16px 0 0", flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:T.textPrimary, display:"flex", alignItems:"center", gap:10 }}>
            {item.logo && <img src={item.logo} alt="" style={{ width:26, height:26, objectFit:"contain", borderRadius:4 }} />}
            {item.title || "Service"}
          </h3>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {!isEditing && (
              <>
                <button onClick={() => setIsEditing(true)}
                  style={{ padding:"5px 12px", fontSize:11, border:`1px solid ${T.borderStrong}`, borderRadius:7, background:T.blueDim, color:T.blue, cursor:"pointer", fontFamily:"inherit" }}>
                  ✏️ Edit
                </button>
                <button onClick={() => { onClose(); onDelete(item); }}
                  style={{ padding:"5px 12px", fontSize:11, border:"1px solid rgba(239,68,68,0.35)", borderRadius:7, background:"rgba(239,68,68,0.08)", color:"#f87171", cursor:"pointer", fontFamily:"inherit" }}>
                  🗑️ Delete
                </button>
              </>
            )}
            {isEditing && (
              <button onClick={() => setIsEditing(false)}
                style={{ padding:"5px 12px", fontSize:11, border:`1px solid ${T.borderStrong}`, borderRadius:7, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit" }}>
                ← Back
              </button>
            )}
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, marginLeft:2 }}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:"auto", flex:1, padding:"18px 20px 22px" }}>

          {/* ── VIEW MODE ── */}
          {!isEditing && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Logo + status hero */}
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:T.blueDim, borderRadius:10, border:`1px solid ${T.border}` }}>
                {item.logo
                  ? <img src={item.logo} alt={item.title} style={{ width:52, height:52, objectFit:"contain", borderRadius:8, background:"rgba(0,0,0,0.3)", border:`1px solid ${T.borderStrong}`, padding:4 }} />
                  : <div style={{ width:52, height:52, borderRadius:8, background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border:`1px solid ${T.borderStrong}` }}>🔧</div>
                }
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:T.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize:12, color:T.textSecond, marginTop:3 }}>{item.serviceHeader || "—"}</div>
                </div>
                {item.status && (
                  <span style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, background:ss.bg, border:`1px solid ${ss.border}`, color:ss.color, whiteSpace:"nowrap" }}>
                    {item.status}
                  </span>
                )}
              </div>

              {/* Description */}
              {item.serviceDescription && (
                <div>
                  <div style={sectionLabel}>Description</div>
                  <div style={{ fontSize:13, color:T.textSecond, lineHeight:1.75, background:"rgba(0,7,20,0.4)", borderRadius:8, padding:"12px 14px", border:`1px solid ${T.border}` }}>
                    {item.serviceDescription}
                  </div>
                </div>
              )}

              {/* Tools */}
              {item.tools?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Tools</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {item.tools.map(t => (
                      <span key={t} style={{ fontSize:11, padding:"3px 9px", borderRadius:4, background:T.blueDim, color:"#7eb3fa", border:`1px solid ${T.borderStrong}` }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {item.features?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Features</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {item.features.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:T.textSecond }}>
                        <span style={{ color:"#a78bfa", fontSize:10 }}>▸</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic extra properties */}
              {extraProps.length > 0 && (
                <div>
                  <div style={divider} />
                  <div style={sectionLabel}>Additional properties</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {extraProps.map(p => {
                      const raw = item._raw?.[p.name];
                      const val = extractAnyProp(raw);
                      return (
                        <div key={p.name}>
                          <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{p.name}</div>
                          <DynamicCell value={val} type={p.type} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {isEditing && (
            <ServiceForm
              mode="edit"
              initial={item}
              onSubmit={data => onSave(item.id, data)}
              onCancel={() => setIsEditing(false)}
              submitting={editSubmitting}
              result={editResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── Main Dashboard ───────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════
export default function ServicesDashboard() {
  const [services, setServices]         = useState([]);
  const [dbProps, setDbProps]           = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError]     = useState(null);

  const [showCreate, setShowCreate]         = useState(false);
  const [createResult, setCreateResult]     = useState(null);
  const [submitting, setSubmitting]         = useState(false);

  const [showProperties, setShowProperties] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editResult, setEditResult]         = useState(null);

  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const [viewItem, setViewItem]             = useState(null);

  useEffect(() => { fetchServices(); fetchDbProps(); }, []);

  async function fetchDbProps() {
    try {
      const res  = await fetch(`${BASE_URL}/admin/services/db-properties`, { headers:{ "x-api-key": ADMIN_KEY } });
      const data = await res.json();
      if (data.success) setDbProps(data.data);
    } catch { /* silent */ }
  }

  async function fetchServices() {
    setTableLoading(true); setTableError(null);
    try {
      const res  = await fetch(`${BASE_URL}/api/notion-services`, { headers:{ "x-api-key": PUBLIC_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const results = Array.isArray(json) ? json : json.results || json.data || [];
      setServices(results.map(normalisePage));
    } catch(err) { setTableError(err.message); }
    finally { setTableLoading(false); }
  }

  // ── File upload helper ────────────────────────────────────────
  async function uploadFile(file) {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch(`${BASE_URL}/admin/upload`, { method:"POST", headers:{ "x-api-key": ADMIN_KEY }, body:fd });
    if (!res.ok) throw new Error("Upload failed: " + await res.text());
    return (await res.json()).fileId;
  }

  // ── Create ────────────────────────────────────────────────────
  async function handleCreate({ title, serviceHeader, serviceDescription, tools, features, logoFile }) {
    setCreateResult(null);
    if (!title.trim()) return setCreateResult({ type:"error", msg:"Title is required." });
    setSubmitting(true);
    try {
      let logoFileId = null;
      if (logoFile) logoFileId = await uploadFile(logoFile);
      const payload = {
        title:              title.trim(),
        ...(serviceHeader      && { serviceHeader:      serviceHeader.trim()      }),
        ...(serviceDescription && { serviceDescription: serviceDescription.trim() }),
        ...(tools.size         && { tools:   [...tools]                           }),
        ...(features.size      && { features:[...features]                        }),
        ...(logoFileId         && { logoFileId                                    }),
      };
      const res  = await fetch(`${BASE_URL}/admin/services`, { method:"POST", headers:{ "Content-Type":"application/json","x-api-key":ADMIN_KEY }, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCreateResult({ type:"success", msg:`✓ Created! ID: ${data.id}` });
      setTimeout(() => { setShowCreate(false); setCreateResult(null); }, 1400);
      fetchServices();
    } catch(err) { setCreateResult({ type:"error", msg:err.message }); }
    finally { setSubmitting(false); }
  }

  // ── Edit / update ─────────────────────────────────────────────
  async function handleEdit(id, { title, serviceHeader, serviceDescription, tools, features, logoFile }) {
    setEditResult(null); setEditSubmitting(true);
    try {
      let logoFileId = null;
      if (logoFile) logoFileId = await uploadFile(logoFile);
      const payload = {
        ...(title              && { title:              title.trim()              }),
        ...(serviceHeader      !== undefined && { serviceHeader:      serviceHeader.trim()      }),
        ...(serviceDescription !== undefined && { serviceDescription: serviceDescription.trim() }),
        tools:    [...tools],
        features: [...features],
        ...(logoFileId         && { logoFileId                                    }),
      };
      const res  = await fetch(`${BASE_URL}/admin/services/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json","x-api-key":ADMIN_KEY }, body:JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setEditResult({ type:"success", msg:"✓ Saved!" });
      setTimeout(() => { setEditResult(null); setViewItem(null); fetchServices(); }, 900);
    } catch(err) { setEditResult({ type:"error", msg:err.message }); }
    finally { setEditSubmitting(false); }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/services/${deleteTarget.id}`, { method:"DELETE", headers:{ "x-api-key": ADMIN_KEY } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed."); }
      setDeleteTarget(null);
      fetchServices();
    } catch(err) { alert("Delete failed: " + err.message); }
    finally { setDeleteLoading(false); }
  }

  // ── Column definitions ────────────────────────────────────────
  const CORE_COLS = [
    { key:"_logo",              label:"Logo",        w:60,  type:"_logo"        },
    { key:"title",              label:"Title",       w:180, type:"title"        },
    { key:"status",             label:"Status",      w:130, type:"status"       },
    { key:"serviceHeader",      label:"Header",      w:210, type:"text"         },
    { key:"serviceDescription", label:"Description", w:260, type:"text"         },
    { key:"tools",              label:"Tools",       w:190, type:"multi_select" },
    { key:"features",           label:"Features",    w:200, type:"multi_select" },
  ];

  const CORE_NAMES = new Set(["Title","Service Header","Service Description","Logo","Tools","Features","Status"]);
  const dynamicCols = dbProps
    .filter(p => !CORE_NAMES.has(p.name) && p.type !== "title")
    .map(p => ({ key:`_dyn_${p.name}`, label:p.name, w:160, type:p.type, propName:p.name }));

  const ALL_COLS = [...CORE_COLS, ...dynamicCols];
  const totalWidth = ALL_COLS.reduce((s,c) => s + c.w, 0);

  function renderCell(col, item) {
    if (col.propName) {
      const raw = item._raw?.[col.propName];
      const val = extractAnyProp(raw);
      return <DynamicCell value={val} type={col.type} />;
    }
    switch(col.key) {
      case "_logo":
        return item.logo
          ? <img src={item.logo} alt={item.title} style={{ width:32, height:32, objectFit:"contain", borderRadius:5, background:"rgba(0,0,0,0.3)", border:`1px solid ${T.borderStrong}`, padding:3 }} />
          : <div style={{ width:32, height:32, borderRadius:5, background:"rgba(59,130,246,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:`1px solid ${T.border}` }}>🔧</div>;
      case "title":
        return <span style={{ color:T.textPrimary, fontWeight:600, fontSize:12 }}>{item.title || "—"}</span>;
      case "status": {
        if (!item.status) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        const ss = statusStyle(item.status);
        return <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:500, background:ss.bg, border:`1px solid ${ss.border}`, color:ss.color, whiteSpace:"nowrap" }}>{item.status}</span>;
      }
      case "serviceHeader":
        return <span style={{ color:T.textSecond, fontSize:11 }}>{item.serviceHeader || "—"}</span>;
      case "serviceDescription":
        return <span style={{ color:T.textMuted, fontSize:11 }}>{item.serviceDescription || "—"}</span>;
      case "tools":
      case "features": {
        const arr = item[col.key] || [];
        if (!arr.length) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        return (
          <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
            {arr.slice(0,3).map(t => (
              <span key={t} style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:T.blueDim, color:"#7eb3fa", border:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{t}</span>
            ))}
            {arr.length > 3 && <span style={{ fontSize:9, color:T.textMuted }}>+{arr.length-3}</span>}
          </div>
        );
      }
      default:
        return <span style={{ color:T.textMuted, fontSize:11 }}>—</span>;
    }
  }

  const thStyle = (w) => ({
    padding:"10px 12px", fontWeight:500, fontSize:10, color:T.textMuted,
    textAlign:"left", textTransform:"uppercase", letterSpacing:"0.06em",
    whiteSpace:"nowrap", width:w, minWidth:w,
    borderRight:`1px solid rgba(59,130,246,0.1)`,
  });

  const tdBase = (w, extra={}) => ({
    padding:"10px 12px", verticalAlign:"middle",
    width:w, minWidth:w, maxWidth:w,
    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
    borderRight:`1px solid rgba(59,130,246,0.07)`,
    ...extra,
  });

  return (
    <div style={{ minHeight:"100vh", background:T.navy, padding:"2rem 1rem", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {showCreate && (
        <Modal title="🔧 Add service" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
          <ServiceForm
            mode="create" initial={{}}
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setCreateResult(null); }}
            submitting={submitting}
            result={createResult}
          />
        </Modal>
      )}

      {showProperties && (
        <PropertiesModal
          onClose={() => setShowProperties(false)}
          onPropsChanged={() => { fetchDbProps(); fetchServices(); }}
        />
      )}

      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

      {viewItem && (
        <ViewModal
          item={viewItem}
          dbProps={dbProps}
          onClose={() => { setViewItem(null); setEditResult(null); }}
          onDelete={(item) => setDeleteTarget(item)}
          onSave={handleEdit}
          editSubmitting={editSubmitting}
          editResult={editResult}
        />
      )}

      <div style={{ width:"100%", maxWidth:"100%", margin:"0 auto", background:T.navyCard, borderRadius:16, border:`1px solid ${T.borderStrong}`, overflow:"hidden" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px", borderBottom:`1px solid ${T.border}`, background:T.navyDeep }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:T.blue, margin:0 }}>🔧 Services</h2>
            <p style={{ fontSize:12, color:T.textMuted, margin:"3px 0 0" }}>
              {services.length} record{services.length!==1?"s":""} · {ALL_COLS.length} columns ({dynamicCols.length} dynamic) · synced from Notion
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowProperties(true)}
              style={{ padding:"7px 12px", fontSize:12, border:`1px solid ${T.borderStrong}`, borderRadius:8, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
              🗂️ Properties
            </button>
            <button onClick={() => { fetchServices(); fetchDbProps(); }} disabled={tableLoading}
              style={{ padding:"7px 14px", fontSize:12, border:`1px solid ${T.borderStrong}`, borderRadius:8, background:T.blueDim, color:T.blue, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"inherit" }}>
              {tableLoading ? "↻ Refreshing…" : "🔄 Refresh"}
            </button>
            <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
              style={{ padding:"7px 16px", fontSize:12, border:"none", borderRadius:8, background:T.blue, color:"#fff", cursor:"pointer", fontWeight:600, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
              + Create
            </button>
          </div>
        </div>

        {dynamicCols.length > 0 && (
          <div style={{ padding:"8px 22px", background:"rgba(167,139,250,0.07)", borderBottom:`1px solid rgba(167,139,250,0.15)`, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"#a78bfa" }}>✦</span>
            <span style={{ fontSize:11, color:"#a78bfa" }}>
              {dynamicCols.length} dynamic {dynamicCols.length===1?"column":"columns"} from DB schema: {dynamicCols.map(c => c.label).join(", ")}
            </span>
          </div>
        )}

        {tableError && (
          <div style={{ padding:"10px 22px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:13, margin:"12px 22px", borderRadius:8 }}>
            ⚠ {tableError}
          </div>
        )}

        <div style={{ overflowX:"auto", width:"100%" }}>
          <table style={{ borderCollapse:"collapse", fontSize:12, tableLayout:"fixed", width:totalWidth }}>
            <thead>
              <tr style={{ background:T.navyDeep, borderBottom:`1px solid ${T.borderStrong}` }}>
                {ALL_COLS.map((col, i) => (
                  <th key={col.key} style={{
                    ...thStyle(col.w),
                    borderRight: i < ALL_COLS.length-1 ? `1px solid rgba(59,130,246,0.1)` : "none",
                    ...(col.propName && { color:"#a78bfa", background:"rgba(167,139,250,0.05)" }),
                  }}>
                    {col.propName && <span style={{ marginRight:4, opacity:0.6 }}>✦</span>}
                    {col.label}
                    {col.propName && (
                      <span style={{ display:"block", fontSize:8, color:"rgba(167,139,250,0.6)", fontWeight:400, textTransform:"none", letterSpacing:0, marginTop:1 }}>{col.type}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableLoading && services.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>Fetching records…</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>No services yet. Click <strong style={{ color:T.blue }}>+ Create</strong> to add one.</td></tr>
              ) : (
                services.map((item, index) => (
                  <tr key={item.id || index}
                    onClick={() => setViewItem(item)}
                    style={{
                      borderBottom:`1px solid ${T.border}`,
                      background: index%2===0 ? T.navyRow : T.navyRowAlt,
                      transition:"background 0.1s", cursor:"pointer",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = index%2===0 ? T.navyRow : T.navyRowAlt; }}
                  >
                    {ALL_COLS.map((col, i) => (
                      <td key={col.key} style={{
                        ...tdBase(col.w),
                        borderRight: i < ALL_COLS.length-1 ? `1px solid rgba(59,130,246,0.07)` : "none",
                        ...(col.key === "_logo" && { textAlign:"center" }),
                        ...(col.key === "serviceDescription" && { whiteSpace:"nowrap" }),
                        ...(col.propName && { background:"rgba(167,139,250,0.03)" }),
                      }}>
                        {renderCell(col, item)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding:"9px 22px", fontSize:11, color:T.textMuted, textAlign:"right", borderTop:`1px solid ${T.border}`, background:T.navyDeep, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize:10 }}>
            ✦ Purple columns are dynamically generated from your DB schema
          </span>
          <span>Showing {services.length} row{services.length!==1?"s":""} · {ALL_COLS.length} columns · click any row to view</span>
        </div>
      </div>
    </div>
  );
}