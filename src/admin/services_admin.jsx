import { useState, useEffect } from "react";

// ── Module imports ────────────────────────────────────────────────
import {
  BASE_URL, PUBLIC_KEY, ADMIN_KEY,
  T, CORE_PROP_NAMES,
} from "./admin_essentials/constants";

import { normalisePage, extractAnyProp } from "./admin_essentials";

import { DynamicCell, DeleteModal } from "./admin_essentials/primitives";

import EditModal, { ServiceForm } from "./admin_essentials/services_editmodal";
import PropertiesModal            from "./admin_essentials/services_propertiesmodal";

// ── Modal wrapper (Create only — EditModal handles view/edit) ─────
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

// ════════════════════════════════════════════════════════════════════
// ── Main Dashboard ───────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════
export default function ServicesDashboard() {
  const [services, setServices]         = useState([]);
  const [dbProps, setDbProps]           = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError]     = useState(null);

  const [showCreate, setShowCreate]     = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const [showProperties, setShowProperties] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editResult, setEditResult]         = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchServices(); fetchDbProps(); }, []);

  // ── Fetch DB schema ───────────────────────────────────────────
  async function fetchDbProps() {
    try {
      const res  = await fetch(`${BASE_URL}/admin/services/db-properties`, { headers:{ "x-api-key": ADMIN_KEY } });
      const data = await res.json();
      if (data.success) setDbProps(data.data);
    } catch { /* silent */ }
  }

  // ── Fetch services list ───────────────────────────────────────
  async function fetchServices() {
    setTableLoading(true); setTableError(null);
    try {
      const res  = await fetch(`${BASE_URL}/api/notion-services`, { headers:{ "x-api-key": PUBLIC_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const results = Array.isArray(json) ? json : json.results || json.data || [];
      setServices(results.map(normalisePage));
    } catch (err) { setTableError(err.message); }
    finally { setTableLoading(false); }
  }

  // ── File upload helper ────────────────────────────────────────
  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${BASE_URL}/admin/upload`, { method:"POST", headers:{ "x-api-key": ADMIN_KEY }, body:fd });
    if (!res.ok) throw new Error("Upload failed: " + await res.text());
    return (await res.json()).fileId;
  }

  // ── Create ────────────────────────────────────────────────────
  async function handleCreate({ title, serviceHeader, serviceDescription, tools, features, logoFile, dynValues, dynFileObjs }) {
    setCreateResult(null);
    if (!title.trim()) return setCreateResult({ type: "error", msg: "Title is required." });
    setSubmitting(true);
    try {
      // Upload logo
      let logoFileId = null;
      if (logoFile) logoFileId = await uploadFile(logoFile);
  
      // Upload any dynamic file props and inject their fileIds into dynValues
      const resolvedDynValues = { ...dynValues };
      if (dynFileObjs && Object.keys(dynFileObjs).length > 0) {
        await Promise.all(
          Object.entries(dynFileObjs).map(async ([propName, file]) => {
            if (!file) return;
            const fileId = await uploadFile(file);
            resolvedDynValues[propName] = fileId; // backend will handle file_upload type
          })
        );
      }
  
      const payload = {
        title:              title.trim(),
        ...(serviceHeader      && { serviceHeader:      serviceHeader.trim()      }),
        ...(serviceDescription && { serviceDescription: serviceDescription.trim() }),
        ...(tools.size         && { tools:    [...tools]                          }),
        ...(features.size      && { features: [...features]                       }),
        ...(logoFileId         && { logoFileId                                    }),
        ...(Object.keys(resolvedDynValues).length && { dynValues: resolvedDynValues }),
      };
  
      const res  = await fetch(`${BASE_URL}/admin/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCreateResult({ type: "success", msg: `✓ Created! ID: ${data.id}` });
      setTimeout(() => { setShowCreate(false); setCreateResult(null); }, 1400);
      fetchServices();
    } catch (err) {
      setCreateResult({ type: "error", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Edit / update ─────────────────────────────────────────────
  async function handleEdit(id, { title, serviceHeader, serviceDescription, tools, features, logoFile, dynValues, dynFileObjs }) {
    setEditResult(null); setEditSubmitting(true);
    try {
      // Upload logo
      let logoFileId = null;
      if (logoFile) logoFileId = await uploadFile(logoFile);
  
      // Upload any dynamic file props
      const resolvedDynValues = { ...dynValues };
      if (dynFileObjs && Object.keys(dynFileObjs).length > 0) {
        await Promise.all(
          Object.entries(dynFileObjs).map(async ([propName, file]) => {
            if (!file) return;
            const fileId = await uploadFile(file);
            resolvedDynValues[propName] = fileId;
          })
        );
      }
  
      const payload = {
        ...(title              && { title:              title.trim()              }),
        ...(serviceHeader      !== undefined && { serviceHeader:      serviceHeader.trim()      }),
        ...(serviceDescription !== undefined && { serviceDescription: serviceDescription.trim() }),
        tools:    [...tools],
        features: [...features],
        ...(logoFileId && { logoFileId }),
        ...(Object.keys(resolvedDynValues).length && { dynValues: resolvedDynValues }),
      };
  
      const res  = await fetch(`${BASE_URL}/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-api-key": ADMIN_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setEditResult({ type: "success", msg: "✓ Saved!" });
      setTimeout(() => { setEditResult(null); setViewItem(null); fetchServices(); }, 900);
    } catch (err) {
      setEditResult({ type: "error", msg: err.message });
    } finally {
      setEditSubmitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/services/${deleteTarget.id}`, {
        method:"DELETE",
        headers:{ "x-api-key": ADMIN_KEY },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed."); }
      setDeleteTarget(null);
      fetchServices();
    } catch (err) { alert("Delete failed: " + err.message); }
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

  const dynamicCols = dbProps
    .filter(p => !CORE_PROP_NAMES.has(p.name) && p.type !== "title")
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
      case "_logo":
        return item.logo
          ? <img src={item.logo} alt={item.title} style={{ width:32, height:32, objectFit:"contain", borderRadius:5, background:"rgba(0,0,0,0.3)", border:`1px solid ${T.borderStrong}`, padding:3 }} />
          : <div style={{ width:32, height:32, borderRadius:5, background:"rgba(59,130,246,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:`1px solid ${T.border}` }}>🔧</div>;

      case "title":
        return <span style={{ color:T.textPrimary, fontWeight:600, fontSize:12 }}>{item.title || "—"}</span>;

      case "status": {
        if (!item.status) return <span style={{ color:T.textMuted, fontStyle:"italic", fontSize:11 }}>—</span>;
        // Import-free inline status badge — statusStyle is only needed in primitives/modals
        const STATUS_COLORS = {
          "Open":       { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80" },
          "Coming Soon":{ bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
          "Closed":     { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   color:"#f87171" },
          "Draft":      { bg:"rgba(100,116,139,0.12)",border:"rgba(100,116,139,0.3)", color:"#94a3b8" },
        };
        const ss = STATUS_COLORS[item.status] || { bg:"rgba(100,116,139,0.12)", border:"rgba(100,116,139,0.3)", color:"#94a3b8" };
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
            {arr.slice(0, 3).map(t => (
              <span key={t} style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:T.blueDim, color:"#7eb3fa", border:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{t}</span>
            ))}
            {arr.length > 3 && <span style={{ fontSize:9, color:T.textMuted }}>+{arr.length - 3}</span>}
          </div>
        );
      }

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
        <Modal title="🔧 Add service" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
          <ServiceForm
            mode="create"
            initial={{}}
            dbProps={dbProps}
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setCreateResult(null); }}
            submitting={submitting}
            result={createResult}
          />
        </Modal>
      )}

      {/* ── Properties modal ── */}
      {showProperties && (
        <PropertiesModal
          onClose={() => setShowProperties(false)}
          onPropsChanged={() => { fetchDbProps(); fetchServices(); }}
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
        <EditModal
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
      <div style={{ width:"100%", maxWidth:"100%", margin:"0 auto", background:T.navyCard, borderRadius:16, border:`1px solid ${T.borderStrong}`, overflow:"hidden" }}>

        {/* Header bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px", borderBottom:`1px solid ${T.border}`, background:T.navyDeep }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:T.blue, margin:0 }}>🔧 Services</h2>
            <p style={{ fontSize:12, color:T.textMuted, margin:"3px 0 0" }}>
              {services.length} record{services.length !== 1 ? "s" : ""} · {ALL_COLS.length} columns ({dynamicCols.length} dynamic) · synced from Notion
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
              <tr style={{ background:T.navyDeep, borderBottom:`1px solid ${T.borderStrong}` }}>
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
              {tableLoading && services.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>Fetching records…</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={ALL_COLS.length} style={{ padding:32, textAlign:"center", color:T.textMuted }}>No services yet. Click <strong style={{ color:T.blue }}>+ Create</strong> to add one.</td></tr>
              ) : (
                services.map((item, index) => (
                  <tr key={item.id || index}
                    onClick={() => setViewItem(item)}
                    style={{ borderBottom:`1px solid ${T.border}`, background:index % 2 === 0 ? T.navyRow : T.navyRowAlt, transition:"background 0.1s", cursor:"pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? T.navyRow : T.navyRowAlt; }}
                  >
                    {ALL_COLS.map((col, i) => (
                      <td key={col.key} style={{
                        ...tdBase(col.w),
                        borderRight: i < ALL_COLS.length - 1 ? `1px solid rgba(59,130,246,0.07)` : "none",
                        ...(col.key === "_logo"              && { textAlign:"center" }),
                        ...(col.key === "serviceDescription" && { whiteSpace:"nowrap" }),
                        ...(col.propName                     && { background:"rgba(167,139,250,0.03)" }),
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
        <div style={{ padding:"9px 22px", fontSize:11, color:T.textMuted, borderTop:`1px solid ${T.border}`, background:T.navyDeep, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize:10 }}>
            ✦ Purple columns are dynamically generated from your DB schema
          </span>
          <span>Showing {services.length} row{services.length !== 1 ? "s" : ""} · {ALL_COLS.length} columns · click any row to view</span>
        </div>
      </div>
    </div>
  );
}