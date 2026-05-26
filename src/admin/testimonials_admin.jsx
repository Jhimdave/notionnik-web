import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL    = import.meta.env.VITE_API_URL;
const API_KEY     = import.meta.env.VITE_API_CLIENT_KEY;
const API_KEY_GET = import.meta.env.VITE_API_SECRET;

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

// ── Status helpers ────────────────────────────────────────────────
const statusColors = {
  "Approved":          { bg: "#dcfce7", color: "#16a34a" },
  "Screenshot Edited": { bg: "#fef3c7", color: "#b45309" },
  "Screenshot Editing":{ bg: "#fff7ed", color: "#c2410c" },
  "Data Gathering":    { bg: "#eff6ff", color: "#1d4ed8" },
  "To Gather Data":    { bg: "#f3f4f6", color: "#4b5563" },
};
function statusStyle(s) {
  return statusColors[s] || { bg: "#f3f4f6", color: "#4b5563" };
}

// ── Shared style tokens ───────────────────────────────────────────
const inputStyle = {
  width: "100%", fontSize: 13, padding: "7px 10px",
  border: "1px solid #e5e7eb", borderRadius: 7,
  background: "#fff", color: "#111827", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const sectionLabel = {
  fontSize: 10, fontWeight: 700, color: "#9ca3af",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
};
const divider = { height: 1, background: "#f3f4f6", margin: "18px 0" };

// ── Small helpers ─────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4, fontWeight: 500 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

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
            fontSize: onChange ? 26 : 14, cursor: onChange ? "pointer" : "default",
            color: n <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s", userSelect: "none",
          }}
        >★</span>
      ))}
      {value > 0 && onChange && (
        <span style={{ fontSize: 11, color: "#9ca3af", alignSelf: "center", marginLeft: 4 }}>{value}/5</span>
      )}
    </div>
  );
}

function UploadZone({ label, hint, emoji, preview, onChange }) {
  const ref = useRef();
  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        border: "1.5px dashed #d1d5db", borderRadius: 9, padding: "14px 10px",
        textAlign: "center", cursor: "pointer", background: "#f9fafb",
        transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#6b7280"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#d1d5db"}
      >
        <input ref={ref} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
          style={{ display: "none" }} onChange={e => onChange(e.target.files[0])} />
        <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
        <p style={{ fontSize: 12, color: "#374151", fontWeight: 500, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{hint}</p>
      </div>
      {preview && <img src={preview} alt="preview"
        style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 7, marginTop: 6, border: "1px solid #e5e7eb" }} />}
    </div>
  );
}

function Avatar({ name, src, size = 32 }) {
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: "#4338ca", flexShrink: 0 }}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>;
}

// ── Client card (shown in form after selecting) ───────────────────
function ClientCard({ client, onClear }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9, marginTop: 6 }}>
      <Avatar name={client.name} src={client.avatar} size={36} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111827" }}>{client.name}</p>
        <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
      </div>
      <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#9ca3af" }}>×</button>
    </div>
  );
}

// ── ContractTitleField ────────────────────────────────────────────
function ContractTitleField({ clientContractTitle, value, onChange }) {
  const [useCustom, setUseCustom] = useState(false);
  useEffect(() => setUseCustom(false), [clientContractTitle]);

  if (!clientContractTitle) return <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. 60 minute consultation" />;
  if (useCustom) return (
    <div style={{ display: "flex", gap: 5 }}>
      <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder="Custom contract title…" autoFocus />
      <button onClick={() => { setUseCustom(false); onChange(clientContractTitle); }}
        style={{ padding: "7px 9px", fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 7, background: "#f9fafb", color: "#6b7280", cursor: "pointer", whiteSpace: "nowrap" }}>
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
      <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Auto-filled · choose "Custom…" to override</p>
    </div>
  );
}

// ── Pill toggle ───────────────────────────────────────────────────
function PillToggle({ options, selected, onToggle, activeColor = "#3b82f6", activeBg = "#eff6ff" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "1px solid", fontFamily: "inherit",
            borderColor: active ? activeColor : "#e5e7eb",
            background: active ? activeBg : "#fff",
            color: active ? activeColor : "#6b7280",
            fontWeight: active ? 500 : 400, transition: "all 0.15s",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 14, padding: "28px 28px 24px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", zIndex: 1 }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", textAlign: "center", margin: "0 0 8px" }}>Delete testimonial?</h3>
        <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
          This will permanently remove the record for <strong>{item?.displayName || "this client"}</strong>. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 8, background: loading ? "#9ca3af" : "#dc2626", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create/Edit Form (used inside modal) ──────────────────────────
function TestimonialForm({ mode, initial, clients, clientsLoading, clientsError, onRetryClients, onSubmit, onCancel, submitting, result }) {
  const [feedback, setFeedback]           = useState(initial?.feedback      || "");
  const [contractTitle, setContractTitle] = useState(initial?.contractTitle || "");
  const [projectTitle, setProjectTitle]   = useState(initial?.projectTitle  || "");
  const [category, setCategory]           = useState(initial?.category      || "");
  const [credLink, setCredLink]           = useState(initial?.credibilityLink || "");
  const [rating, setRating]               = useState(initial?.rate          || 0);
  const [status, setStatus]               = useState(initial?.status        || "");
  const [tools, setTools]                 = useState(new Set(initial?.tools || []));
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch]   = useState("");
  const [screenshotFile, setScreenshotFile]       = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [rawFile, setRawFile]             = useState(null);
  const [rawPreview, setRawPreview]       = useState(null);

  const isEdit = mode === "edit";

  const filteredClients = clients.filter(c => {
    const s = clientSearch.toLowerCase();
    return !clientSearch || c?.name?.toLowerCase()?.includes(s) || c?.company?.toLowerCase()?.includes(s);
  });

  function toggleTool(t) {
    setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }

  function handleSubmit() {
    onSubmit({
      feedback, contractTitle, projectTitle, category,
      credLink, rating, status, tools,
      selectedClient, screenshotFile, rawFile,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Client — only for create */}
      {!isEdit && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionLabel}>Client (relation)</div>
          {!selectedClient ? (
            <>
              <Field label="Search & select client" required hint="Type a name or company to filter">
                <input style={inputStyle} value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="e.g. Jack Andrews, EDGEhomes…" />
              </Field>
              {clientsLoading && <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0" }}>Loading clients…</p>}
              {clientsError && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "4px 0" }}>
                  <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>⚠ {clientsError}</p>
                  <button onClick={onRetryClients} style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Retry</button>
                </div>
              )}
              {filteredClients.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 9, overflow: "hidden", marginTop: 4, maxHeight: 220, overflowY: "auto" }}>
                  {filteredClients.map((client, idx) => (
                    <div key={client.id} onClick={() => { setSelectedClient(client); setClientSearch(""); if (client.contractTitle) setContractTitle(client.contractTitle); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", borderTop: idx > 0 ? "1px solid #f3f4f6" : "none", background: "#fff", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <Avatar name={client.name} src={client.avatar} size={32} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: "#111827" }}>{client.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
                      </div>
                      {client.contractTitle && <span style={{ fontSize: 10, color: "#6b7280", background: "#f3f4f6", padding: "2px 7px", borderRadius: 20 }}>{client.contractTitle}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>Selected client</p>
              <ClientCard client={selectedClient} onClear={() => { setSelectedClient(null); setContractTitle(""); }} />
            </>
          )}
          <div style={divider} />
        </div>
      )}

      {/* Feedback */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Feedback</div>
        <Field label="Feedback text" required>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={2000}
            placeholder="What did the client say…"
            style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }} />
          <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginTop: 2 }}>{feedback.length}/2000</div>
        </Field>
      </div>

      {/* Project details */}
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

      {/* Rating */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Rating</div>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Status */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Status</div>
        <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="#fef3c7" />
      </div>

      {/* Tools */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Tools used</div>
        <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} activeColor="#3b82f6" activeBg="#eff6ff" />
      </div>

      <div style={divider} />

      {/* Screenshots */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Screenshots</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <UploadZone label="Feedback screenshot" hint="Edited · JPG PNG WEBP" emoji="📸"
            preview={screenshotPreview}
            onChange={f => { setScreenshotFile(f); setScreenshotPreview(f ? URL.createObjectURL(f) : null); }} />
          <UploadZone label="Raw screenshot" hint="Original unedited" emoji="🗂️"
            preview={rawPreview}
            onChange={f => { setRawFile(f); setRawPreview(f ? URL.createObjectURL(f) : null); }} />
        </div>
      </div>

      {result && (
        <div style={{ padding: "10px 12px", borderRadius: 7, marginBottom: 12, fontSize: 12,
          background: result.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: result.type === "success" ? "#15803d" : "#dc2626",
          border: `1px solid ${result.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
          {result.msg}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 7, background: "transparent", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting} style={{
          padding: "8px 20px", fontSize: 12, border: "none", borderRadius: 7,
          background: submitting ? "#9ca3af" : "#111827", color: "#fff",
          cursor: submitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {submitting ? "⏳ Saving…" : isEdit ? "💾 Save changes" : "🚀 Create testimonial"}
        </button>
      </div>
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", zIndex: 1, animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: "20px 24px 24px", overflowY: "auto", maxHeight: "calc(90vh - 70px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Inline edit row ───────────────────────────────────────────────
function InlineEditRow({ item, colCount, onSave, onCancel, submitting, result }) {
  const [feedback, setFeedback]           = useState(item.feedback      || "");
  const [contractTitle, setContractTitle] = useState(item.contractTitle || "");
  const [projectTitle, setProjectTitle]   = useState(item.projectTitle  || "");
  const [category, setCategory]           = useState(item.category      || "");
  const [credLink, setCredLink]           = useState(item.credibilityLink || "");
  const [rating, setRating]               = useState(item.rate          || 0);
  const [status, setStatus]               = useState(item.status        || "");
  const [tools, setTools]                 = useState(new Set(item.tools || []));

  function toggleTool(t) {
    setTools(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }

  return (
    <tr>
      <td colSpan={colCount} style={{ padding: "16px 20px", background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 12 }}>
          <Field label="Feedback text" required>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Field label="Project title">
              <input style={inputStyle} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
            </Field>
            <Field label="Contract title">
              <input style={inputStyle} value={contractTitle} onChange={e => setContractTitle(e.target.value)} />
            </Field>
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
          <PillToggle options={STATUSES} selected={status} onToggle={s => setStatus(status === s ? "" : s)} activeColor="#f59e0b" activeBg="#fef3c7" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={sectionLabel}>Tools</div>
          <PillToggle options={TOOLS_LIST} selected={[...tools]} onToggle={toggleTool} />
        </div>
        {result && (
          <div style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 10, fontSize: 12,
            background: result.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: result.type === "success" ? "#15803d" : "#dc2626",
            border: `1px solid ${result.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
            {result.msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "7px 14px", fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 7, background: "#fff", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={() => onSave({ feedback, contractTitle, projectTitle, category, credLink, rating, status, tools })}
            disabled={submitting}
            style={{ padding: "7px 16px", fontSize: 12, border: "none", borderRadius: 7, background: submitting ? "#9ca3af" : "#111827", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit" }}>
            {submitting ? "Saving…" : "💾 Save changes"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main dashboard ────────────────────────────────────────────────
export default function TestimonialsDashboard() {
  const [clients, setClients]               = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError]     = useState(null);
  const [testimonials, setTestimonials]     = useState([]);
  const [tableLoading, setTableLoading]     = useState(false);
  const [tableError, setTableError]         = useState(null);

  // Modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  // Inline edit
  const [editingId, setEditingId]     = useState(null);
  const [editResult, setEditResult]   = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchClients(); fetchTestimonials(); }, []);

  async function fetchClients() {
    setClientsLoading(true); setClientsError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/clients`, { headers: { "Content-Type": "application/json", "x-api-key": API_KEY } });
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
      const res = await fetch(`${BASE_URL}/api/testimonials`, { headers: { "Content-Type": "application/json", "x-api-key": API_KEY_GET } });
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

  // ── CREATE ────────────────────────────────────────────────────
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
        ...(contractTitle && { contractTitle: contractTitle.trim() }),
        ...(projectTitle  && { projectTitle:  projectTitle.trim()  }),
        ...(category      && { category }),
        ...(credLink      && { credibilityLink: credLink.trim() }),
        ...(rating        && { rate: rating }),
        ...(status        && { status }),
        ...(tools.size    && { tools: [...tools] }),
        ...(screenshotFileId && { screenshotFileId }),
        ...(rawFileId        && { rawFileId }),
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

  // ── EDIT ──────────────────────────────────────────────────────
  async function handleEdit(id, { feedback, contractTitle, projectTitle, category, credLink, rating, status, tools }) {
    setEditResult(null); setEditSubmitting(true);
    try {
      const payload = {
        feedback: feedback.trim(),
        ...(contractTitle && { contractTitle: contractTitle.trim() }),
        ...(projectTitle  && { projectTitle:  projectTitle.trim()  }),
        ...(category      && { category }),
        ...(credLink      && { credibilityLink: credLink.trim() }),
        rate: rating || 0,
        ...(status        && { status }),
        tools: [...tools],
      };
      const res  = await fetch(`${BASE_URL}/admin/testimonials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-api-key": API_KEY }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setEditResult({ type: "success", msg: "✓ Saved!" });
      setTimeout(() => { setEditingId(null); setEditResult(null); }, 900);
      fetchTestimonials();
    } catch (err) { setEditResult({ type: "error", msg: err.message }); }
    finally { setEditSubmitting(false); }
  }

  // ── DELETE ────────────────────────────────────────────────────
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

  const COL_COUNT = 6;

  return (
    <div style={{ minHeight: "100vh", background: "#000e2b", padding: "2rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── CREATE MODAL ─────────────────────────────────────── */}
      {showCreate && (
        <Modal title="⭐ Add testimonial" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
          <TestimonialForm
            mode="create"
            initial={{}}
            clients={clients}
            clientsLoading={clientsLoading}
            clientsError={clientsError}
            onRetryClients={fetchClients}
            onSubmit={handleCreate}
            onCancel={() => { setShowCreate(false); setCreateResult(null); }}
            submitting={submitting}
            result={createResult}
          />
        </Modal>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── TABLE CONTAINER ──────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1140, margin: "0 auto", background: "#ebebeb", borderRadius: 16, border: "1px solid #e5e7eb", padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#86a6eb", margin: 0 }}>📋 Testimonials</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>
              {testimonials.length} record{testimonials.length !== 1 ? "s" : ""} · synced from Notion
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchTestimonials} disabled={tableLoading}
              style={{ padding: "7px 14px", fontSize: 12, border: "1px solid #4b6baa", borderRadius: 8, background: "#798de6", color: "#245dc5", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
              {tableLoading ? "↻ Refreshing…" : "🔄 Refresh"}
            </button>
            <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
              style={{ padding: "7px 16px", fontSize: 12, border: "none", borderRadius: 8, background: "#111827", color: "#fff", cursor: "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              + Create
            </button>
          </div>
        </div>

        {tableError && (
          <div style={{ padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
            ⚠ {tableError}
          </div>
        )}

        <div style={{ overflowX: "auto", border: "1px solid #b1c5f1", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#374151", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563", width: 190 }}>Client</th>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563" }}>Project</th>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563" }}>Feedback</th>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563", width: 100 }}>Rating</th>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563", width: 130 }}>Status</th>
                <th style={{ padding: "11px 16px", fontWeight: 600, color: "#4b5563", width: 100, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading && testimonials.length === 0 ? (
                <tr><td colSpan={COL_COUNT} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Fetching records…</td></tr>
              ) : testimonials.length === 0 ? (
                <tr><td colSpan={COL_COUNT} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No testimonials yet. Click <strong>+ Create</strong> to add one.</td></tr>
              ) : (
                testimonials.map((item, index) => {
                  const cName    = item.displayName || "Unknown Client";
                  const cCompany = item.company     || "";
                  const cAvatar  = item.image       || null;
                  const pTitle   = item.projectTitle  || "—";
                  const pContract= item.contractTitle || "";
                  const fText    = item.feedback      || "";
                  const isEditing = editingId === item.id;
                  const ss = statusStyle(item.status);

                  return [
                    <tr key={item.id || index} style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: isEditing ? "#f0f9ff" : index % 2 === 0 ? "#ffffff" : "#fcfdfd",
                      transition: "background 0.15s",
                    }}>
                      {/* Client */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar name={cName} src={cAvatar} size={28} />
                          <div>
                            <div style={{ fontWeight: 500, color: "#111827" }}>{cName}</div>
                            {cCompany && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{cCompany}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Project */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 500 }}>{pTitle}</div>
                        {pContract && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{pContract}</div>}
                        {item.category && (
                          <span style={{ display: "inline-block", background: "#f3f4f6", fontSize: 10, color: "#4b5563", padding: "2px 6px", borderRadius: 4, marginTop: 5 }}>
                            {item.category}
                          </span>
                        )}
                      </td>
                      {/* Feedback */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#4b5563", lineHeight: 1.5, maxWidth: 280 }}>
                        <div style={{ wordBreak: "break-word" }}>
                          {fText.length > 110 ? `${fText.slice(0, 110)}…` : fText || "—"}
                        </div>
                        {item.tools?.length > 0 && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                            {item.tools.map(t => (
                              <span key={t} style={{ fontSize: 9, background: "#eff6ff", color: "#1d0892", padding: "1px 5px", borderRadius: 3 }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      {/* Rating */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <StarRating value={item.rate || 0} />
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        {item.status ? (
                          <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 12, fontSize: 11, fontWeight: 500, background: ss.bg, color: ss.color }}>
                            {item.status}
                          </span>
                        ) : (
                          <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 11 }}>Unassigned</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 16px", verticalAlign: "top", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => { setEditingId(isEditing ? null : item.id); setEditResult(null); }}
                            title={isEditing ? "Cancel edit" : "Edit"}
                            style={{ padding: "5px 10px", fontSize: 12, border: `1px solid ${isEditing ? "#3b82f6" : "#e5e7eb"}`, borderRadius: 6, background: isEditing ? "#eff6ff" : "#fff", color: isEditing ? "#1d4ed8" : "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
                            {isEditing ? "✕ Cancel" : "✏️ Edit"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            title="Delete"
                            style={{ padding: "5px 10px", fontSize: 12, border: "1px solid #fecaca", borderRadius: 6, background: "#fff", color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>,

                    /* Inline edit row — only for the item being edited */
                    isEditing && (
                      <InlineEditRow
                        key={`edit-${item.id}`}
                        item={item}
                        colCount={COL_COUNT}
                        onSave={fields => handleEdit(item.id, fields)}
                        onCancel={() => { setEditingId(null); setEditResult(null); }}
                        submitting={editSubmitting}
                        result={editResult}
                      />
                    ),
                  ];
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af", textAlign: "right" }}>
          Showing {testimonials.length} row{testimonials.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}