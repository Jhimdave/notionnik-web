import { useState, useEffect } from "react";
import {
  T,
  CATEGORIES, TOOLS_LIST, STATUSES,
  CORE_PROP_NAMES,
} from "./constants";
import { extractAnyProp } from "./index";
import {
  Field, StarRating, UploadZone, Avatar,
  ClientCard, ContractTitleField,
  PillToggle, AlertBox,
  DynamicField, DynamicCell,
} from "./primitives";

// ── shared tokens ─────────────────────────────────────────────────
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
const divider = { height:1, background:"rgba(59,130,246,0.18)", margin:"16px 0" };

// ── Extra props filter (shared) ───────────────────────────────────
function getExtraProps(dbProps) {
  return dbProps.filter(p =>
    !CORE_PROP_NAMES.has(p.name) &&
    p.type !== "title" &&
    !p.name.includes("(from client")
  );
}

function resolveRole(item) {
  return item.reviewerRole || item.role || item["Reviewer Role"] || item.clientRole || item.client_role || "";
}
function resolveImageUrl(item) {
  const candidates = [item.image, item.avatar, item.clientImage, item.client_image, item.profileImage, item.profile_image, item.photo, item.clientAvatar, item.client_avatar];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string" && c.startsWith("http")) return c;
    if (Array.isArray(c) && c[0]) { const f = c[0]; if (typeof f === "string") return f; if (f?.url) return f.url; if (f?.file?.url) return f.file.url; if (f?.external?.url) return f.external.url; }
    if (c?.url) return c.url; if (c?.file?.url) return c.file.url;
  }
  return null;
}
function resolveScreenshot(val) {
  if (!val) return null;
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (Array.isArray(val) && val.length > 0) { const f = val[0]; if (typeof f === "string") return f; if (f?.url) return f.url; if (f?.file?.url) return f.file.url; if (f?.external?.url) return f.external.url; }
  if (val?.url) return val.url; if (val?.file?.url) return val.file.url;
  return null;
}

// ── Reusable files property upload field ──────────────────────────
function FilePropField({ name, value, onChange }) {
  const currentUrl  = typeof value === "string" && value.startsWith("http") ? value : null;
  const pendingFile = value instanceof File ? value : null;

  // ── Generate preview URL for image files ─────────────────────
  const previewUrl = pendingFile?.type?.startsWith("image/")
    ? URL.createObjectURL(pendingFile)
    : null;

  return (
    <Field label={name}>
      {/* Current file — show thumbnail if it looks like an image */}
      {currentUrl && !pendingFile && (
        <div style={{ marginBottom:8 }}>
          {/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(currentUrl) ? (
            <img src={currentUrl} alt={name}
              style={{ width:"100%", maxHeight:120, objectFit:"cover", borderRadius:7, border:`1px solid ${T.borderStrong}`, marginBottom:6, display:"block" }} />
          ) : null}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <a href={currentUrl} target="_blank" rel="noreferrer"
              style={{ fontSize:11, color:T.blue, wordBreak:"break-all", flex:1 }}>
              📎 Current file
            </a>
            <button onClick={() => onChange(null)}
              style={{ fontSize:11, color:"#f87171", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              🗑️ Remove
            </button>
          </div>
        </div>
      )}

      {/* Upload zone — passes previewUrl so image shows immediately */}
      <UploadZone
        label={pendingFile ? "Replace file" : `Upload ${name}`}
        hint="Image, PDF, Office · Max 5 MB"
        emoji="📎"
        preview={previewUrl}
        onChange={f => onChange(f)}
      />

      {/* Pending non-image file confirmation */}
      {pendingFile && !previewUrl && (
        <div style={{ marginTop:6, padding:"7px 10px", borderRadius:7, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:"#4ade80" }}>
            ✓ {pendingFile.name} ({(pendingFile.size / 1024).toFixed(0)} KB)
          </span>
          <button onClick={() => onChange(currentUrl ?? null)}
            style={{ fontSize:11, color:T.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            × Clear
          </button>
        </div>
      )}

      {/* Clear button when image preview is shown */}
      {pendingFile && previewUrl && (
        <button onClick={() => onChange(currentUrl ?? null)}
          style={{ marginTop:4, fontSize:11, color:T.textMuted, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>
          × Clear new upload
        </button>
      )}
    </Field>
  );
}

// ── Dynamic extra props renderer (handles files inline) ───────────
function ExtraPropsFields({ extraProps, dynValues, setDyn }) {
  if (!extraProps.length) return null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
      {extraProps.map(p =>
        p.type === "files" ? (
          <FilePropField
            key={p.name}
            name={p.name}
            value={dynValues[p.name]}
            onChange={val => setDyn(p.name, val)}
          />
        ) : (
          <DynamicField
            key={p.name}
            prop={p}
            value={dynValues[p.name]}
            onChange={val => setDyn(p.name, val)}
          />
        )
      )}
    </div>
  );
}

// ── TestimonialForm (create mode) ────────────────────────────────
export function TestimonialForm({ mode, initial, dbProps = [], clients, clientsLoading, clientsError, onRetryClients, onSubmit, onCancel, submitting, result }) {
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

  const extraProps = getExtraProps(dbProps);

  const [dynValues, setDynValues] = useState(() => buildInitialDyn(extraProps, initial));
  useEffect(() => { setDynValues(buildInitialDyn(extraProps, initial)); }, [initial?.id]);

  function buildInitialDyn(props, item) {
    const init = {};
    props?.forEach(p => { const raw = item?._raw?.[p.name]; init[p.name] = raw !== undefined ? (extractAnyProp(raw) ?? "") : ""; });
    return init;
  }
  function setDyn(name, val) { setDynValues(prev => ({ ...prev, [name]: val })); }

  const filteredClients = clients.filter(c => {
    const s = clientSearch.toLowerCase();
    return !clientSearch || c?.name?.toLowerCase()?.includes(s) || c?.company?.toLowerCase()?.includes(s);
  });
  function toggleTool(t) { setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function handleSubmit() { onSubmit({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, selectedClient, screenshotFile, rawFile, dynValues }); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* Client selector */}
      <div style={{ marginBottom:20 }}>
        <div style={sectionLabel}>Client (relation)</div>
        {!selectedClient ? (
          <>
            <Field label="Search & select client" required hint="Type a name or company to filter">
              <input style={inputStyle} value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="e.g. Jack Andrews, EDGEhomes…" />
            </Field>
            {clientsLoading && <p style={{ fontSize:12, color:T.textMuted, margin:"4px 0" }}>Loading clients…</p>}
            {clientsError && (
              <div style={{ display:"flex", gap:6, alignItems:"center", margin:"4px 0" }}>
                <p style={{ fontSize:12, color:"#f87171", margin:0 }}>⚠ {clientsError}</p>
                <button onClick={onRetryClients} style={{ fontSize:11, color:T.blue, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", padding:0 }}>Retry</button>
              </div>
            )}
            {filteredClients.length > 0 && (
              <div style={{ border:`1px solid rgba(59,130,246,0.35)`, borderRadius:9, overflow:"hidden", marginTop:4, maxHeight:220, overflowY:"auto" }}>
                {filteredClients.map((client, idx) => (
                  <div key={client.id}
                    onClick={() => { setSelectedClient(client); setClientSearch(""); if (client.contractTitle) setContractTitle(client.contractTitle); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", cursor:"pointer", borderTop: idx > 0 ? `1px solid rgba(59,130,246,0.18)` : "none", background:"#0a1f4a", transition:"background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0d2454"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0a1f4a"}>
                    <Avatar name={client.name} src={client.avatar} size={32} />
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontWeight:500, fontSize:13, color:T.textPrimary }}>{client.name}</p>
                      <p style={{ margin:0, fontSize:11, color:T.textMuted }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
                    </div>
                    {client.contractTitle && <span style={{ fontSize:10, color:T.textSecond, background:"#051229", padding:"2px 7px", borderRadius:20 }}>{client.contractTitle}</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize:12, color:T.textSecond, marginBottom:3 }}>Selected client</p>
            <ClientCard client={selectedClient} onClear={() => { setSelectedClient(null); setContractTitle(""); }} />
          </>
        )}
        <div style={divider} />
      </div>

      {/* Feedback */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Feedback</div>
        <Field label="Feedback text" required>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={2000}
            placeholder="What did the client say…"
            style={{ ...inputStyle, minHeight:100, resize:"vertical", lineHeight:1.6 }} />
          <div style={{ fontSize:10, color:T.textMuted, textAlign:"right", marginTop:2 }}>{feedback.length}/2000</div>
        </Field>
      </div>

      {/* Project details */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Project details</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
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

      <div style={{ marginBottom:14 }}>
        <div style={sectionLabel}>Rating</div>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={sectionLabel}>Status</div>
        <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="rgba(245,158,11,0.12)" />
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Tools used</div>
        <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} />
      </div>

      {/* Dynamic extra properties */}
      {extraProps.length > 0 && (
        <>
          <div style={divider} />
          <div style={{ marginBottom:16 }}>
            <div style={{ ...sectionLabel, color:"#a78bfa", display:"flex", alignItems:"center", gap:5 }}>
              <span>✦</span> Additional properties
            </div>
            <ExtraPropsFields extraProps={extraProps} dynValues={dynValues} setDyn={setDyn} />
          </div>
        </>
      )}

      <div style={divider} />

      {/* Screenshots */}
      <div style={{ marginBottom:16 }}>
        <div style={sectionLabel}>Screenshots</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <UploadZone label="Feedback screenshot" hint="Edited · JPG PNG WEBP" emoji="📸" preview={screenshotPreview}
            onChange={f => { setScreenshotFile(f); setScreenshotPreview(f ? URL.createObjectURL(f) : null); }} />
          <UploadZone label="Raw screenshot" hint="Original unedited" emoji="🗂️" preview={rawPreview}
            onChange={f => { setRawFile(f); setRawPreview(f ? URL.createObjectURL(f) : null); }} />
        </div>
      </div>

      <AlertBox result={result} />

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:14, borderTop:`1px solid rgba(59,130,246,0.18)` }}>
        <button onClick={onCancel} style={{ padding:"8px 16px", fontSize:12, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding:"8px 20px", fontSize:12, border:"none", borderRadius:7, background:submitting ? "#4b5563" : T.blue, color:"#fff", cursor:submitting ? "not-allowed" : "pointer", fontWeight:500, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
          {submitting ? "⏳ Saving…" : "🚀 Create testimonial"}
        </button>
      </div>
    </div>
  );
}

// ── ViewModal / EditModal ─────────────────────────────────────────
export default function TestimonialEditModal({ item, dbProps = [], onClose, onDelete, onSave, editSubmitting, editResult }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => { setIsEditing(false); }, [item.id]);

  const ss           = statusStyle(item.status);
  const cs           = categoryStyle(item.category);
  const role         = resolveRole(item);
  const ssUrl        = resolveScreenshot(item.feedbackScreenshot);
  const rawUrl       = resolveScreenshot(item.rawScreenshot);
  const clientAvatar = resolveImageUrl(item);

  // ── FIX: use shared filter (includes "(from client" exclusion) ──
  const extraProps = getExtraProps(dbProps);

  // Edit state
  const [feedback, setFeedback]                   = useState(item.feedback        || "");
  const [contractTitle, setContractTitle]         = useState(item.contractTitle   || "");
  const [projectTitle, setProjectTitle]           = useState(item.projectTitle    || "");
  const [category, setCategory]                   = useState(item.category        || "");
  const [credLink, setCredLink]                   = useState(item.credibilityLink || "");
  const [rating, setRating]                       = useState(item.rate            || 0);
  const [status, setStatus]                       = useState(item.status          || "");
  const [tools, setTools]                         = useState(new Set(item.tools   || []));
  const [screenshotFile, setScreenshotFile]       = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [rawFile, setRawFile]                     = useState(null);
  const [rawPreview, setRawPreview]               = useState(null);
  const [deleteFeedbackSs, setDeleteFeedbackSs]   = useState(false);
  const [deleteRawSs, setDeleteRawSs]             = useState(false);

  const [dynValues, setDynValues] = useState(() => {
    const init = {};
    extraProps.forEach(p => { const raw = item._raw?.[p.name]; init[p.name] = raw !== undefined ? (extractAnyProp(raw) ?? "") : ""; });
    return init;
  });
  function setDyn(name, val) { setDynValues(prev => ({ ...prev, [name]: val })); }
  function toggleTool(t) { setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }

  function handleSave() {
    onSave(item.id, { feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, screenshotFile, rawFile, deleteFeedbackSs, deleteRawSs, dynValues });
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:16, width:"100%", maxWidth:580, zIndex:1, animation:"modalIn 0.2s ease", maxHeight:"92vh", display:"flex", flexDirection:"column" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>

        {/* Sticky header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid rgba(59,130,246,0.18)`, background:T.navyDeep, borderRadius:"16px 16px 0 0", flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:T.textPrimary }}>{item.displayName} — Testimonial</h3>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {!isEditing && (
              <>
                <button onClick={() => setIsEditing(true)} style={{ padding:"5px 12px", fontSize:11, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7, background:"rgba(59,130,246,0.15)", color:T.blue, cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>
                <button onClick={() => { onClose(); onDelete(item); }} style={{ padding:"5px 12px", fontSize:11, border:"1px solid rgba(239,68,68,0.35)", borderRadius:7, background:"rgba(239,68,68,0.08)", color:"#f87171", cursor:"pointer", fontFamily:"inherit" }}>🗑️ Delete</button>
              </>
            )}
            {isEditing && (
              <button onClick={() => setIsEditing(false)} style={{ padding:"5px 12px", fontSize:11, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
            )}
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, marginLeft:2 }}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:"auto", flex:1, padding:"18px 20px 22px" }}>

          {/* ════ VIEW MODE ════ */}
          {!isEditing && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(59,130,246,0.15)", borderRadius:9, border:`1px solid rgba(59,130,246,0.18)` }}>
                <Avatar name={item.displayName} src={clientAvatar} size={44} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>{item.displayName}</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{[role, item.company].filter(Boolean).join(" · ") || "—"}</div>
                </div>
                <StarRating value={item.rate || 0} />
              </div>

              <div>
                <div style={sectionLabel}>Feedback</div>
                <div style={{ fontSize:13, color:T.textSecond, lineHeight:1.7, background:"rgba(0,7,20,0.4)", borderRadius:8, padding:"12px 14px", border:`1px solid rgba(59,130,246,0.18)` }}>{item.feedback || "No feedback provided."}</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["Project title", item.projectTitle||"—"], ["Contract title", item.contractTitle||"—"], ["Company", item.company||"—"], ["Reviewer role", role||"—"]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:13, color:T.textPrimary, fontWeight:500 }}>{val}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Status</div>
                  {item.status ? <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:ss.bg, border:`1px solid ${ss.border}`, color:ss.color }}>{item.status}</span> : <span style={{ fontSize:12, color:T.textMuted, fontStyle:"italic" }}>—</span>}
                </div>
                <div>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Category</div>
                  {item.category ? <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:cs.bg, border:`1px solid ${cs.border}`, color:cs.color }}>{item.category}</span> : <span style={{ fontSize:12, color:T.textMuted, fontStyle:"italic" }}>—</span>}
                </div>
              </div>

              {item.tools?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Tools used</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {item.tools.map(t => <span key={t} style={{ fontSize:11, padding:"3px 9px", borderRadius:4, background:"rgba(59,130,246,0.15)", color:"#7eb3fa", border:`1px solid rgba(59,130,246,0.35)` }}>{t}</span>)}
                  </div>
                </div>
              )}

              {/* Dynamic extra properties — view */}
              {extraProps.length > 0 && (
                <div>
                  <div style={{ height:1, background:"rgba(59,130,246,0.18)", margin:"4px 0 12px" }} />
                  <div style={{ ...sectionLabel, color:"#a78bfa", display:"flex", alignItems:"center", gap:5 }}><span>✦</span> Additional properties</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {extraProps.map(p => {
                      const val = extractAnyProp(item._raw?.[p.name]);
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

              {(ssUrl || rawUrl) ? (
                <div>
                  <div style={sectionLabel}>Screenshots</div>
                  <div style={{ display:"grid", gridTemplateColumns: ssUrl && rawUrl ? "1fr 1fr" : "1fr", gap:10 }}>
                    {ssUrl && <div><div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>📸 Feedback screenshot</div><a href={ssUrl} target="_blank" rel="noreferrer"><img src={ssUrl} alt="Feedback" style={{ width:"100%", borderRadius:8, border:`1px solid rgba(59,130,246,0.35)`, display:"block", objectFit:"cover", maxHeight:220, cursor:"zoom-in" }} onError={e => { e.currentTarget.style.display="none"; }} /></a></div>}
                    {rawUrl && <div><div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>🗂️ Raw screenshot</div><a href={rawUrl} target="_blank" rel="noreferrer"><img src={rawUrl} alt="Raw" style={{ width:"100%", borderRadius:8, border:`1px solid rgba(59,130,246,0.35)`, display:"block", objectFit:"cover", maxHeight:220, cursor:"zoom-in" }} onError={e => { e.currentTarget.style.display="none"; }} /></a></div>}
                  </div>
                </div>
              ) : (
                <div style={{ padding:14, borderRadius:8, border:`1px dashed rgba(59,130,246,0.18)`, textAlign:"center" }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>📷</div>
                  <div style={{ fontSize:12, color:T.textMuted }}>No screenshots uploaded yet</div>
                </div>
              )}

              {item.credibilityLink && (
                <div>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Credibility link</div>
                  <a href={item.credibilityLink} target="_blank" rel="noreferrer" style={{ fontSize:12, color:T.blue, wordBreak:"break-all" }}>{item.credibilityLink}</a>
                </div>
              )}
            </div>
          )}

          {/* ════ EDIT MODE ════ */}
          {isEditing && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ marginBottom:4 }}>
                <div style={sectionLabel}>Feedback</div>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                  style={{ ...inputStyle, minHeight:90, resize:"vertical", lineHeight:1.6 }} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Field label="Project title"><input style={inputStyle} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} /></Field>
                <Field label="Contract title"><input style={inputStyle} value={contractTitle} onChange={e => setContractTitle(e.target.value)} /></Field>
                <Field label="Category">
                  <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">— select —</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Credibility link"><input style={inputStyle} type="url" value={credLink} onChange={e => setCredLink(e.target.value)} placeholder="https://…" /></Field>
              </div>

              <div><div style={sectionLabel}>Rating</div><StarRating value={rating} onChange={setRating} /></div>
              <div><div style={sectionLabel}>Status</div><PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="rgba(245,158,11,0.12)" /></div>
              <div><div style={sectionLabel}>Tools used</div><PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} /></div>

              {/* Dynamic extra properties — edit (now handles files) */}
              {extraProps.length > 0 && (
                <>
                  <div style={{ height:1, background:"rgba(59,130,246,0.18)", margin:"4px 0" }} />
                  <div>
                    <div style={{ ...sectionLabel, color:"#a78bfa", display:"flex", alignItems:"center", gap:5 }}><span>✦</span> Additional properties</div>
                    <ExtraPropsFields extraProps={extraProps} dynValues={dynValues} setDyn={setDyn} />
                  </div>
                </>
              )}

              <div style={{ height:1, background:"rgba(59,130,246,0.18)", margin:"4px 0" }} />

              {/* Screenshots edit */}
              <div>
                <div style={sectionLabel}>Screenshots</div>
                {/* Feedback Screenshot */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, color:T.textSecond, marginBottom:6 }}>📸 Feedback Screenshot</div>
                  {item.feedbackScreenshot && !deleteFeedbackSs && !screenshotFile && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <img src={item.feedbackScreenshot} alt="Current" style={{ width:80, height:52, objectFit:"cover", borderRadius:6, border:`1px solid rgba(59,130,246,0.35)` }} />
                      <span style={{ fontSize:11, color:T.textMuted }}>Current</span>
                      <button onClick={() => setDeleteFeedbackSs(true)} style={{ fontSize:11, color:"#f87171", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit" }}>🗑️ Remove</button>
                    </div>
                  )}
                  {deleteFeedbackSs && !screenshotFile && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:11, color:"#f87171" }}>⚠ Will be removed on save</span>
                      <button onClick={() => setDeleteFeedbackSs(false)} style={{ fontSize:11, color:T.textSecond, background:"none", border:`1px solid rgba(59,130,246,0.35)`, borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit" }}>Undo</button>
                    </div>
                  )}
                  <UploadZone label="Upload new feedback screenshot" hint="Replaces current · JPG PNG WEBP" emoji="📸" preview={screenshotPreview}
                    onChange={f => { setScreenshotFile(f); setScreenshotPreview(f ? URL.createObjectURL(f) : null); if (f) setDeleteFeedbackSs(false); }} />
                  {screenshotFile && <button onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }} style={{ marginTop:4, fontSize:11, color:T.textMuted, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>× Clear new upload</button>}
                </div>
                {/* Raw Screenshot */}
                <div>
                  <div style={{ fontSize:11, color:T.textSecond, marginBottom:6 }}>🗂️ Raw Screenshot</div>
                  {item.rawScreenshot && !deleteRawSs && !rawFile && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <img src={item.rawScreenshot} alt="Current" style={{ width:80, height:52, objectFit:"cover", borderRadius:6, border:`1px solid rgba(59,130,246,0.35)` }} />
                      <span style={{ fontSize:11, color:T.textMuted }}>Current</span>
                      <button onClick={() => setDeleteRawSs(true)} style={{ fontSize:11, color:"#f87171", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit" }}>🗑️ Remove</button>
                    </div>
                  )}
                  {deleteRawSs && !rawFile && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:11, color:"#f87171" }}>⚠ Will be removed on save</span>
                      <button onClick={() => setDeleteRawSs(false)} style={{ fontSize:11, color:T.textSecond, background:"none", border:`1px solid rgba(59,130,246,0.35)`, borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit" }}>Undo</button>
                    </div>
                  )}
                  <UploadZone label="Upload new raw screenshot" hint="Original unedited · JPG PNG WEBP" emoji="🗂️" preview={rawPreview}
                    onChange={f => { setRawFile(f); setRawPreview(f ? URL.createObjectURL(f) : null); if (f) setDeleteRawSs(false); }} />
                  {rawFile && <button onClick={() => { setRawFile(null); setRawPreview(null); }} style={{ marginTop:4, fontSize:11, color:T.textMuted, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>× Clear new upload</button>}
                </div>
              </div>

              <AlertBox result={editResult} />

              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:8, borderTop:`1px solid rgba(59,130,246,0.18)` }}>
                <button onClick={() => setIsEditing(false)} style={{ padding:"8px 16px", fontSize:12, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                <button onClick={handleSave} disabled={editSubmitting}
                  style={{ padding:"8px 20px", fontSize:12, border:"none", borderRadius:7, background:editSubmitting ? "#4b5563" : T.blue, color:"#fff", cursor:editSubmitting ? "not-allowed" : "pointer", fontWeight:500, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
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

// ── Status / Category style helpers (local to this file) ─────────
function statusStyle(s) {
  const MAP = {
    "Approved":           { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80" },
    "Screenshot Edited":  { bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
    "Screenshot Editing": { bg:"rgba(249,115,22,0.1)",  border:"rgba(249,115,22,0.3)",  color:"#fb923c" },
    "Data Gathering":     { bg:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.3)",  color:"#7eb3fa" },
    "To Gather Data":     { bg:"rgba(100,116,139,0.12)",border:"rgba(100,116,139,0.3)", color:"#94a3b8" },
  };
  return MAP[s] || { bg:"rgba(100,116,139,0.12)", border:"rgba(100,116,139,0.3)", color:"#94a3b8" };
}
function categoryStyle(c) {
  const MAP = {
    "Notion x Automation": { bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
    "Notion Setup":        { bg:"rgba(168,85,247,0.1)",  border:"rgba(168,85,247,0.3)",  color:"#c084fc" },
    "Automation":          { bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
    "Website Development": { bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.3)",   color:"#4ade80" },
    "Google App Script":   { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   color:"#f87171" },
    "Consultation":        { bg:"rgba(59,130,246,0.1)",  border:"rgba(59,130,246,0.3)",  color:"#7eb3fa" },
  };
  return MAP[c] || { bg:"rgba(100,116,139,0.12)", border:"rgba(100,116,139,0.3)", color:"#94a3b8" };
}