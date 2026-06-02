import { useState, useEffect } from "react";

// ── Module imports ────────────────────────────────────────────────
import {
  BASE_URL, PUBLIC_KEY, ADMIN_KEY,
  T, CORE_PROP_NAMES,
} from "./admin_essentials/constants";

import { extractAnyProp } from "./admin_essentials";

import { Avatar, AlertBox, DeleteModal, DynamicCell } from "./admin_essentials/primitives";

import TestimonialEditModal, { TestimonialForm } from "./admin_essentials/testimonials_editmodal";
import TestimonialsPropertiesModal              from "./admin_essentials/testimonials_propertiesmodal";

// ── Helpers ───────────────────────────────────────────────────────
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

// ── Status / Category badge styles ───────────────────────────────
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

// ── Screenshot thumbnail ──────────────────────────────────────────
function SsThumb({ url, label }) {
  const resolved = resolveScreenshot(url);
  if (!resolved) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
  return (
    <a href={resolved} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title={label}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:38, height:26, borderRadius:4, background:"rgba(59,130,246,0.15)", border:`1px solid rgba(59,130,246,0.35)`, fontSize:9, color:"#7eb3fa", textDecoration:"none", cursor:"pointer" }}>
      📷
    </a>
  );
}

// ── Modal wrapper (Create only) ───────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,7,20,0.85)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:T.navyCard, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:16, width:"100%", maxWidth:680, zIndex:1, animation:"modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:`1px solid rgba(59,130,246,0.18)`, background:T.navyDeep, borderRadius:"16px 16px 0 0" }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:600, color:T.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:T.textMuted, lineHeight:1, padding:4 }}>×</button>
        </div>
        <div style={{ padding:"20px 24px 24px", overflowY:"auto", maxHeight:"calc(90vh - 70px)" }}>{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── Main Dashboard ───────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════
export default function TestimonialsDashboard() {
  const [clients, setClients]               = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError]     = useState(null);
  const [testimonials, setTestimonials]     = useState([]);
  const [dbProps, setDbProps]               = useState([]);
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

  useEffect(() => { fetchClients(); fetchTestimonials(); fetchDbProps(); }, []);

  // ── Data fetching ─────────────────────────────────────────────
  async function fetchDbProps() {
    try {
      const res  = await fetch(`${BASE_URL}/admin/testimonials/db-properties`, { headers:{ "x-api-key": ADMIN_KEY } });
      const data = await res.json();
      if (data.success) setDbProps(data.data);
    } catch { /* silent */ }
  }

  async function fetchClients() {
    setClientsLoading(true); setClientsError(null);
    try {
      const res  = await fetch(`${BASE_URL}/admin/clients`, { headers:{ "Content-Type":"application/json", "x-api-key": ADMIN_KEY } });
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
      const res  = await fetch(`${BASE_URL}/api/testimonials`, { headers:{ "Content-Type":"application/json", "x-api-key": PUBLIC_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTestimonials(Array.isArray(json) ? json : json.data || []);
    } catch (err) { setTableError(err.message); }
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
  async function handleCreate({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, selectedClient, screenshotFile, rawFile, dynValues }) {
  setCreateResult(null);
  if (!feedback.trim())  return setCreateResult({ type:"error", msg:"Feedback text is required." });
  if (!selectedClient)   return setCreateResult({ type:"error", msg:"Please select a client." });
  setSubmitting(true);
  try {
    let screenshotFileId = null, rawFileId = null;
    if (screenshotFile) screenshotFileId = await uploadFile(screenshotFile);
    if (rawFile)        rawFileId        = await uploadFile(rawFile);

    // ── Upload any File objects inside dynValues ──────────────
    const resolvedDynValues = {};
    for (const [key, val] of Object.entries(dynValues ?? {})) {
      resolvedDynValues[key] = val instanceof File ? await uploadFile(val) : val;
    }
    // ─────────────────────────────────────────────────────────

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
      dynValues: resolvedDynValues,  // ← always send, always resolved
    };
      const res  = await fetch(`${BASE_URL}/admin/testimonials`, {
        method:"POST", headers:{ "Content-Type":"application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCreateResult({ type:"success", msg:`✓ Created! Notion ID: ${data.id}` });
      setTimeout(() => { setShowCreate(false); setCreateResult(null); }, 1400);
      fetchTestimonials();
    } catch (err) { setCreateResult({ type:"error", msg: err.message }); }
    finally { setSubmitting(false); }
  }

  // ── Edit ──────────────────────────────────────────────────────────
  async function handleEdit(id, { feedback, contractTitle, projectTitle, category, credLink, rating, status, tools, screenshotFile, rawFile, deleteFeedbackSs, deleteRawSs, dynValues }) {
    setEditResult(null); setEditSubmitting(true);
    try {
      let screenshotFileId = null, rawFileId = null;
      if (screenshotFile) screenshotFileId = await uploadFile(screenshotFile);
      if (rawFile)        rawFileId        = await uploadFile(rawFile);

      // ── Upload any File objects inside dynValues ──────────────────
      const resolvedDynValues = {};
      for (const [key, val] of Object.entries(dynValues ?? {})) {
        if (val instanceof File) {
          resolvedDynValues[key] = await uploadFile(val); // → fileId string
        } else {
          resolvedDynValues[key] = val;
        }
      }
      // ─────────────────────────────────────────────────────────────

      const payload = {
        feedback: feedback.trim(),
        ...(contractTitle !== undefined && { contractTitle: contractTitle.trim()   }),
        ...(projectTitle  !== undefined && { projectTitle:  projectTitle.trim()    }),
        ...(category      && { category                                            }),
        ...(credLink      !== undefined && { credibilityLink: credLink.trim()      }),
        rate: rating || 0,
        ...(status        && { status                                              }),
        tools: [...tools],
        ...(screenshotFileId && { screenshotFileId                                 }),
        ...(rawFileId        && { rawFileId                                        }),
        ...(deleteFeedbackSs && { deleteFeedbackSs: true                           }),
        ...(deleteRawSs      && { deleteRawSs:      true                           }),
        dynValues: resolvedDynValues,   // ← resolved, no raw File objects
      };

      const res  = await fetch(`${BASE_URL}/admin/testimonials/${id}`, {
        method:"PATCH", headers:{ "Content-Type":"application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setEditResult({ type:"success", msg:"✓ Saved!" });
      setTimeout(() => { setEditResult(null); setViewItem(null); fetchTestimonials(); }, 900);
    } catch (err) { setEditResult({ type:"error", msg: err.message }); }
    finally { setEditSubmitting(false); }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/delete/${deleteTarget.id}`, {
        method:"DELETE", headers:{ "x-api-key": ADMIN_KEY },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed."); }
      setDeleteTarget(null);
      fetchTestimonials();
    } catch (err) { alert("Delete failed: " + err.message); }
    finally { setDeleteLoading(false); }
  }

  // ── Column definitions — core + dynamic ──────────────────────
  const CORE_COLS = [
    { key:"feedback",           label:"Feedback",        w:200, type:"text"         },
    { key:"status",             label:"Status",          w:142, type:"status"       },
    { key:"contractTitle",      label:"Contract Title",  w:170, type:"text"         },
    { key:"company",            label:"Company",         w:130, type:"text"         },
    { key:"displayName",        label:"Display Name",    w:115, type:"text"         },
    { key:"projectTitle",       label:"Project Title",   w:175, type:"text"         },
    { key:"_client",            label:"Client",          w:155, type:"_client"      },
    { key:"reviewerRole",       label:"Reviewer Role",   w:130, type:"text"         },
    { key:"tools",              label:"Tools",           w:165, type:"multi_select" },
    { key:"rawScreenshot",      label:"Raw SS",          w:72,  type:"_ss"          },
    { key:"feedbackScreenshot", label:"Feedback SS",     w:88,  type:"_ss"          },
    { key:"credibilityLink",    label:"Credibility Link",w:150, type:"url"          },
    { key:"category",           label:"Category",        w:152, type:"category"     },
    { key:"rate",               label:"Rating",          w:90,  type:"rating"       },
  ];

  const dynamicCols = dbProps
  .filter(p =>
    !CORE_PROP_NAMES.has(p.name) &&
    p.type !== "title" &&
    !p.name.includes("(from client)")
  )
    .map(p => ({ key:`_dyn_${p.name}`, label:p.name, w:160, type:p.type, propName:p.name }));

  const ALL_COLS   = [...CORE_COLS, ...dynamicCols];
  const totalWidth = ALL_COLS.reduce((s, c) => s + c.w, 0);

  // ── Cell renderer ─────────────────────────────────────────────
  function renderCell(col, item) {
    // Dynamic schema columns
    if (col.propName) {
      const val = extractAnyProp(item._raw?.[col.propName]);
      return <DynamicCell value={val} type={col.type} />;
    }

    switch (col.key) {
      case "feedback":
        return <span style={{ color:T.textSecond, fontSize:11 }}>{item.feedback || "—"}</span>;

      case "status": {
        if (!item.status) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        const ss = statusStyle(item.status);
        return <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:500, background:ss.bg, border:`1px solid ${ss.border}`, color:ss.color, whiteSpace:"nowrap" }}>{item.status}</span>;
      }

      case "contractTitle":
        return <span style={{ color:T.textPrimary, fontWeight:500, fontSize:12 }}>{item.contractTitle || "—"}</span>;

      case "company":
        return <span style={{ color:T.textSecond }}>{item.company || "—"}</span>;

      case "displayName":
        return <span style={{ color:T.textPrimary, fontWeight:500 }}>{item.displayName || "—"}</span>;

      case "projectTitle":
        return <span style={{ color:T.textSecond, fontSize:11 }}>{item.projectTitle || "—"}</span>;

      case "_client":
        return (
          <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
            <Avatar name={item.displayName || "?"} src={resolveImageUrl(item)} size={24} />
            <span style={{ fontWeight:500, color:T.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:12 }}>{item.displayName || "Unknown"}</span>
          </div>
        );

      case "reviewerRole":
        return <span style={{ fontSize:11, color:T.textSecond }}>{resolveRole(item) || "—"}</span>;

      case "tools": {
        const arr = item.tools || [];
        if (!arr.length) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        return (
          <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
            {arr.slice(0, 3).map(t => <span key={t} style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:"rgba(59,130,246,0.15)", color:"#7eb3fa", border:`1px solid rgba(59,130,246,0.18)`, whiteSpace:"nowrap" }}>{t}</span>)}
            {arr.length > 3 && <span style={{ fontSize:9, color:T.textMuted }}>+{arr.length - 3}</span>}
          </div>
        );
      }

      case "rawScreenshot":
        return <SsThumb url={resolveScreenshot(item.rawScreenshot)} label="Raw screenshot" />;

      case "feedbackScreenshot":
        return <SsThumb url={resolveScreenshot(item.feedbackScreenshot)} label="Feedback screenshot" />;

      case "credibilityLink":
        return item.credibilityLink
          ? <a href={item.credibilityLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:T.blue, textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", display:"block" }}>{item.credibilityLink.replace(/^https?:\/\//, "")}</a>
          : <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;

      case "category": {
        if (!item.category) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        const cs = categoryStyle(item.category);
        return <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:500, background:cs.bg, border:`1px solid ${cs.border}`, color:cs.color, whiteSpace:"nowrap" }}>{item.category}</span>;
      }

      case "rate":
        return (
          <div style={{ display:"flex", gap:1 }}>
            {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:11, color: n <= (item.rate || 0) ? "#f59e0b" : "#1e3a6e" }}>★</span>)}
          </div>
        );

      default:
        return <span style={{ color:T.textMuted, fontSize:11 }}>—</span>;
    }
  }

  // ── Table style helpers ───────────────────────────────────────
  const thStyle = w => ({
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

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.navy, padding:"2rem 1rem", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* ── Create modal ── */}
      {showCreate && (
        <Modal title="⭐ Add testimonial" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
          <TestimonialForm
            mode="create" initial={{}}
            dbProps={dbProps}
            clients={clients} clientsLoading={clientsLoading} clientsError={clientsError}
            onRetryClients={fetchClients} onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setCreateResult(null); }}
            submitting={submitting} result={createResult}
          />
        </Modal>
      )}

      {/* ── Properties modal ── */}
      {showProperties && (
        <TestimonialsPropertiesModal
          onClose={() => setShowProperties(false)}
          onPropsChanged={() => { fetchDbProps(); fetchTestimonials(); }}
        />
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── View / Edit modal ── */}
      {viewItem && (
        <TestimonialEditModal
          item={viewItem}
          dbProps={dbProps}
          onClose={() => { setViewItem(null); setEditResult(null); }}
          onDelete={item => { setViewItem(null); setDeleteTarget(item); }}
          onSave={handleEdit}
          editSubmitting={editSubmitting}
          editResult={editResult}
        />
      )}

      {/* ── Table card ── */}
      <div style={{ width:"100%", maxWidth:"100%", margin:"0 auto", background:T.navyCard, borderRadius:16, border:`1px solid rgba(59,130,246,0.35)`, overflow:"hidden" }}>

        {/* Header bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px", borderBottom:`1px solid rgba(59,130,246,0.18)`, background:T.navyDeep }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:T.blue, margin:0 }}>📋 Testimonials</h2>
            <p style={{ fontSize:12, color:T.textMuted, margin:"3px 0 0" }}>
              {testimonials.length} record{testimonials.length !== 1 ? "s" : ""} · {ALL_COLS.length} columns ({dynamicCols.length} dynamic) · synced from Notion
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowProperties(true)}
              style={{ padding:"7px 12px", fontSize:12, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:8, background:"transparent", color:T.textSecond, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
              🗂️ Properties
            </button>
            <button onClick={() => { fetchTestimonials(); fetchDbProps(); }} disabled={tableLoading}
              style={{ padding:"7px 14px", fontSize:12, border:`1px solid rgba(59,130,246,0.35)`, borderRadius:8, background:"rgba(59,130,246,0.15)", color:T.blue, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"inherit" }}>
              {tableLoading ? "↻ Refreshing…" : "🔄 Refresh"}
            </button>
            <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
              style={{ padding:"7px 16px", fontSize:12, border:"none", borderRadius:8, background:T.blue, color:"#fff", cursor:"pointer", fontWeight:600, fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
              + Create
            </button>
          </div>
        </div>

        {/* Dynamic columns banner */}
        {dynamicCols.length > 0 && (
          <div style={{ padding:"8px 22px", background:"rgba(167,139,250,0.07)", borderBottom:`1px solid rgba(167,139,250,0.15)`, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"#a78bfa" }}>✦</span>
            <span style={{ fontSize:11, color:"#a78bfa" }}>
              {dynamicCols.length} dynamic {dynamicCols.length === 1 ? "column" : "columns"} from DB schema: {dynamicCols.map(c => c.label).join(", ")}
            </span>
          </div>
        )}

        {/* Error banner */}
        {tableError && (
          <div style={{ padding:"10px 22px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:13, margin:"12px 22px", borderRadius:8 }}>
            ⚠ {tableError}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX:"auto", width:"100%" }}>
          <table style={{ borderCollapse:"collapse", fontSize:12, tableLayout:"fixed", width:totalWidth }}>
            <thead>
              <tr style={{ background:T.navyDeep, borderBottom:`1px solid rgba(59,130,246,0.35)` }}>
                {ALL_COLS.map((col, i) => (
                  <th key={col.key} style={{
                    ...thStyle(col.w),
                    borderRight: i < ALL_COLS.length - 1 ? `1px solid rgba(59,130,246,0.1)` : "none",
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
              {tableLoading && testimonials.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>Fetching records…</td></tr>
              ) : testimonials.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>No testimonials yet. Click <strong style={{ color:T.blue }}>+ Create</strong> to add one.</td></tr>
              ) : (
                testimonials.map((item, index) => (
                  <tr key={item.id || index}
                    onClick={() => setViewItem(item)}
                    style={{ borderBottom:`1px solid rgba(59,130,246,0.18)`, background: index % 2 === 0 ? "#0a1f4a" : "#0d2454", transition:"background 0.1s", cursor:"pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#0a1f4a" : "#0d2454"; }}
                  >
                    {ALL_COLS.map((col, i) => (
                      <td key={col.key} style={{
                        ...tdBase(col.w),
                        borderRight: i < ALL_COLS.length - 1 ? `1px solid rgba(59,130,246,0.07)` : "none",
                        ...(["rawScreenshot","feedbackScreenshot"].includes(col.key) && { textAlign:"center" }),
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

        {/* Footer */}
        <div style={{ padding:"9px 22px", fontSize:11, color:T.textMuted, borderTop:`1px solid rgba(59,130,246,0.18)`, background:T.navyDeep, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize:10 }}>
            ✦ Purple columns are dynamically generated from your DB schema
          </span>
          <span>Showing {testimonials.length} row{testimonials.length !== 1 ? "s" : ""} · {ALL_COLS.length} columns · click any row to view details</span>
        </div>
      </div>
    </div>
  );
}