import { useState, useEffect } from "react";
import { BASE_URL, ADMIN_KEY, T, PROPERTY_TYPES, NOTION_COLORS, COLOR_DOTS } from "./constants";
import { AlertBox, Field } from "./primitives";

const inputStyle = {
  width:"100%", fontSize:13, padding:"7px 10px",
  border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7,
  background:"#051229", color:"#e8edf8", outline:"none",
  boxSizing:"border-box", fontFamily:"inherit",
};
const sectionLabel = {
  fontSize:10, fontWeight:700, color:"#4d6fa0",
  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8,
};

export default function TestimonialsPropertiesModal({ onClose, onPropsChanged }) {
  const [tab, setTab]                   = useState("add");
  const [props, setProps]               = useState([]);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsError, setPropsError]     = useState(null);
  const [newName, setNewName]           = useState("");
  const [newType, setNewType]           = useState("rich_text");
  const [options, setOptions]           = useState([{ name:"", color:"default" }]);
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
      const res  = await fetch(`${BASE_URL}/admin/testimonials/db-properties`, { headers:{ "x-api-key": ADMIN_KEY } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProps(data.data);
    } catch (err) { setPropsError(err.message); }
    finally { setPropsLoading(false); }
  }

  function addOption() { setOptions(prev => [...prev, { name:"", color:"default" }]); }
  function removeOption(i) { setOptions(prev => prev.filter((_, idx) => idx !== i)); }
  function updateOption(i, key, val) { setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, [key]: val } : o)); }

  async function handleAdd() {
    if (!newName.trim()) return setAddResult({ type:"error", msg:"Property name is required." });
    setAdding(true); setAddResult(null);
    try {
      const body = { name: newName.trim(), type: newType };
      if (needsOptions) body.options = options.filter(o => o.name.trim()).map(o => ({ name: o.name.trim(), color: o.color }));
      const res  = await fetch(`${BASE_URL}/admin/create-testimonial/new-property`, {
        method:"POST", headers:{ "Content-Type":"application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAddResult({ type:"success", msg:`✓ "${newName.trim()}" added!` });
      setNewName(""); setNewType("rich_text"); setOptions([{ name:"", color:"default" }]);
      fetchProps();
      onPropsChanged?.();
    } catch (err) { setAddResult({ type:"error", msg: err.message }); }
    finally { setAdding(false); }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingName(name); setDeleteResult(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/delete-testimonial/property`, {
        method:"DELETE", headers:{ "Content-Type":"application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDeleteResult({ type:"success", msg:`✓ "${name}" deleted.` });
      fetchProps();
      onPropsChanged?.();
    } catch (err) { setDeleteResult({ type:"error", msg: err.message }); }
    finally { setDeletingName(null); }
  }

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{ padding:"7px 16px", fontSize:12, borderRadius:7, cursor:"pointer", border:"none", fontFamily:"inherit", fontWeight: tab === id ? 600 : 400, background: tab === id ? T.blue : "#0a1f4a", color: tab === id ? "#fff" : T.textSecond, display:"flex", alignItems:"center", gap:5 }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:16, width:"100%", maxWidth:520, zIndex:1 }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 14px", borderBottom:`1px solid rgba(59,130,246,0.18)`, background:T.navyDeep, borderRadius:"16px 16px 0 0" }}>
          <div>
            <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:T.textPrimary }}>🗂️ Manage Properties</h2>
            <p style={{ margin:"3px 0 0", fontSize:11, color:T.textMuted }}>Add or remove columns from your Testimonials database</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, padding:4 }}>×</button>
        </div>

        <div style={{ display:"flex", gap:6, padding:"14px 24px 0" }}>
          {tabBtn("add",    "Add Property",    "＋")}
          {tabBtn("remove", "Remove Property", "🗑")}
        </div>

        <div style={{ padding:"16px 24px 24px" }}>
          {tab === "add" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Field label="Property name" required>
                <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Budget, Priority, Notes…" />
              </Field>
              <Field label="Property type" required>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.value} onClick={() => setNewType(t.value)}
                      style={{ padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", border:"1px solid", fontFamily:"inherit", borderColor: newType === t.value ? T.blue : "rgba(59,130,246,0.35)", background: newType === t.value ? "rgba(59,130,246,0.15)" : "transparent", color: newType === t.value ? T.blue : T.textSecond, fontWeight: newType === t.value ? 500 : 400 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>

              {needsOptions && (
                <div>
                  <div style={sectionLabel}>Options</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {options.map((opt, i) => (
                      <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <select value={opt.color} onChange={e => updateOption(i, "color", e.target.value)}
                          style={{ ...inputStyle, width:32, height:32, padding:0, textAlign:"center", background:COLOR_DOTS[opt.color], color:"transparent", cursor:"pointer", borderRadius:6 }}>
                          {NOTION_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input style={{ ...inputStyle, flex:1 }} value={opt.name} onChange={e => updateOption(i, "name", e.target.value)} placeholder={`Option ${i + 1}…`} />
                        {options.length > 1 && <button onClick={() => removeOption(i)} style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:16, padding:"0 4px" }}>×</button>}
                      </div>
                    ))}
                    <button onClick={addOption} style={{ alignSelf:"flex-start", fontSize:11, color:T.blue, background:"none", border:`1px dashed rgba(59,130,246,0.35)`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>+ Add option</button>
                  </div>
                </div>
              )}

              <AlertBox result={addResult} />
              <button onClick={handleAdd} disabled={adding}
                style={{ padding:"9px 0", fontSize:13, border:"none", borderRadius:8, background: adding ? "#4b5563" : T.blue, color:"#fff", cursor: adding ? "not-allowed" : "pointer", fontWeight:500, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {adding ? "⏳ Adding…" : "＋ Add property"}
              </button>
            </div>
          )}

          {tab === "remove" && (
            <div>
              <AlertBox result={deleteResult} />
              {propsLoading && <p style={{ fontSize:12, color:T.textMuted, textAlign:"center", padding:"20px 0" }}>Loading properties…</p>}
              {propsError   && <p style={{ fontSize:12, color:"#f87171" }}>⚠ {propsError}</p>}
              {!propsLoading && props.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:360, overflowY:"auto" }}>
                  {props.map(p => (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:`1px solid rgba(59,130,246,0.18)`, background:"#0a1f4a" }}>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:T.textPrimary }}>{p.name}</span>
                        <span style={{ marginLeft:8, fontSize:10, color:T.textMuted, background:T.navyDeep, padding:"1px 6px", borderRadius:4 }}>{p.type}</span>
                      </div>
                      {p.type === "title" ? (
                        <span style={{ fontSize:10, color:T.textMuted, fontStyle:"italic" }}>protected</span>
                      ) : (
                        <button onClick={() => handleDelete(p.name)} disabled={deletingName === p.name}
                          style={{ padding:"4px 10px", fontSize:11, border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, background:"transparent", color:"#f87171", cursor: deletingName === p.name ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: deletingName === p.name ? 0.5 : 1 }}>
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