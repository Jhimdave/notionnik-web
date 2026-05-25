import { useState, useEffect, useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_URL; // ← change to your server URL

const CATEGORIES = [
  "Notion x Automation",
  "Notion Setup",
  "Google App Script",
  "Consultation",
];

const TOOLS_LIST = [
  "Notion",
  "Automation",
  "Google App Script",
  "Zapier",
  "Make",
  "Airtable",
];

const STATUSES = ["To Gather Data", "Screenshot Editing", "Done"];

// ── Helpers ───────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  fontSize: 14,
  padding: "8px 10px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const sectionLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 10,
};

const divider = { height: 1, background: "#f3f4f6", margin: "20px 0" };

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: 28,
            cursor: "pointer",
            color: n <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.1s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
      {value > 0 && (
        <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center", marginLeft: 6 }}>
          {value}/5
        </span>
      )}
    </div>
  );
}

function UploadZone({ label, hint, emoji, preview, onChange }) {
  const ref = useRef();
  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: "1.5px dashed #d1d5db",
          borderRadius: 10,
          padding: "16px 12px",
          textAlign: "center",
          cursor: "pointer",
          background: "#f9fafb",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6b7280")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
      >
        <input
          ref={ref}
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => onChange(e.target.files[0])}
        />
        <div style={{ fontSize: 22, marginBottom: 5 }}>{emoji}</div>
        <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{hint}</p>
      </div>
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8, border: "1px solid #e5e7eb" }}
        />
      )}
    </div>
  );
}

// ── Client Card (shown after selection) ──────────────────────────
function ClientCard({ client, onClear }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 14px",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: 10,
      marginTop: 8,
    }}>
      {client.avatar ? (
        <img src={client.avatar} alt={client.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb" }} />
      ) : (
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: "#dcfce7",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 600, color: "#16a34a",
        }}>
          {client.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>{client.name}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
          {[client.role, client.company].filter(Boolean).join(" · ")}
        </p>
      </div>
      <button
        onClick={onClear}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", lineHeight: 1 }}
        title="Clear selection"
      >
        ×
      </button>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────
export default function TestimonialsForm() {
  const [apiKey, setApiKey]     = useState("");
  const [showKey, setShowKey]   = useState(false);

  // Clients pool
  const [clients, setClients]           = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null); // full client object
  const [clientSearch, setClientSearch] = useState("");

  // Form fields
  const [feedback, setFeedback]           = useState("");
  const [contractTitle, setContractTitle] = useState("");
  const [projectTitle, setProjectTitle]   = useState("");
  const [category, setCategory]           = useState("");
  const [credLink, setCredLink]           = useState("");
  const [rating, setRating]               = useState(0);
  const [status, setStatus]               = useState("");
  const [tools, setTools]                 = useState(new Set());

  // Screenshot uploads (NOT profile — that comes from the Client relation)
  const [screenshotFile, setScreenshotFile]     = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [rawFile, setRawFile]                   = useState(null);
  const [rawPreview, setRawPreview]             = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);

  // ── Fetch clients when API key is entered ─────────────────────
  useEffect(() => {
    if (!apiKey.trim()) { setClients([]); return; }
    const timer = setTimeout(() => fetchClients(), 600);
    return () => clearTimeout(timer);
  }, [apiKey]);

  async function fetchClients() {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/clients`, {
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) throw new Error("Failed to fetch clients.");
      const data = await res.json();
      setClients(data.data ?? []);
    } catch (err) {
      setClientsError(err.message);
    } finally {
      setClientsLoading(false);
    }
  }

  function handleSelectClient(client) {
    setSelectedClient(client);
    setClientSearch("");
  }

  function toggleTool(tool) {
    setTools((prev) => {
      const next = new Set(prev);
      next.has(tool) ? next.delete(tool) : next.add(tool);
      return next;
    });
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: fd,
    });
    if (!res.ok) throw new Error("File upload failed: " + (await res.text()));
    const data = await res.json();
    return data.fileId;
  }

  async function handleSubmit() {
    setResult(null);
    if (!apiKey.trim())    return setResult({ type: "error", msg: "Admin API key is required." });
    if (!feedback.trim())  return setResult({ type: "error", msg: "Feedback text is required." });
    if (!selectedClient)   return setResult({ type: "error", msg: "Please select a client." });

    setSubmitting(true);
    try {
      let screenshotFileId = null;
      let rawFileId        = null;

      if (screenshotFile) screenshotFileId = await uploadFile(screenshotFile);
      if (rawFile)        rawFileId        = await uploadFile(rawFile);

      const payload = {
        feedback:        feedback.trim(),
        clientId:        selectedClient.id,           // Notion relation page ID
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

      const res = await fetch(`${BASE_URL}/admin/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setResult({ type: "success", msg: `✓ Testimonial created! Notion ID: ${data.id}` });
      handleReset();
    } catch (err) {
      setResult({ type: "error", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFeedback(""); setContractTitle(""); setProjectTitle("");
    setCategory(""); setCredLink(""); setRating(0);
    setStatus(""); setTools(new Set());
    setSelectedClient(null); setClientSearch("");
    setScreenshotFile(null); setScreenshotPreview(null);
    setRawFile(null); setRawPreview(null);
    setResult(null);
  }

  // Filtered client list for search
  const filteredClients = clients.filter((c) =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.company?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "2rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>⭐ Add testimonial</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4, marginBottom: 0 }}>Submits directly to your Notion Testimonials database</p>
        </div>

        {/* API Key */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 24 }}>
          <span>🔑</span>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Admin API key  (x-api-key)"
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111827", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af", padding: 0 }}>
            {showKey ? "🙈" : "👁"}
          </button>
        </div>

        {/* ── CLIENT SELECTION ─────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Client (relation)</div>

          {!selectedClient ? (
            <>
              <Field label="Search & select client" required hint="Type a name or company to filter">
                <input
                  style={inputStyle}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="e.g. Jack Andrews, EDGEhomes…"
                  disabled={!apiKey.trim()}
                />
              </Field>

              {/* Loading / error states */}
              {clientsLoading && (
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0" }}>Loading clients…</p>
              )}
              {clientsError && (
                <p style={{ fontSize: 13, color: "#dc2626", margin: "6px 0" }}>⚠ {clientsError}</p>
              )}
              {!apiKey.trim() && (
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0" }}>Enter your API key above to load the client list.</p>
              )}

              {/* Client list */}
              {filteredClients.length > 0 && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginTop: 6, maxHeight: 260, overflowY: "auto" }}>
                  {filteredClients.map((client, idx) => (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", cursor: "pointer",
                        borderTop: idx > 0 ? "1px solid #f3f4f6" : "none",
                        background: "#fff", transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {client.avatar ? (
                        <img src={client.avatar} alt={client.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#4338ca", flexShrink: 0 }}>
                          {client.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: "#111827" }}>{client.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{[client.role, client.company].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Selected client</p>
              <ClientCard client={selectedClient} onClear={() => setSelectedClient(null)} />
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                ℹ Client profile photo, name, company, and role come from the Client relation — no separate upload needed.
              </p>
            </>
          )}
        </div>

        <div style={divider} />

        {/* ── FEEDBACK ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Feedback</div>
          <Field label="Feedback text" required>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did the client say…"
              maxLength={2000}
              style={{ ...inputStyle, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 3 }}>{feedback.length} / 2000</div>
          </Field>
        </div>

        {/* ── PROJECT DETAILS ───────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Project details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Contract title">
              <input style={inputStyle} value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} placeholder="e.g. 60 minute consultation" />
            </Field>
            <Field label="Project title">
              <input style={inputStyle} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Notion & Automation Consultation" />
            </Field>
            <Field label="Category">
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">— select —</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Credibility link">
              <input style={inputStyle} type="url" value={credLink} onChange={(e) => setCredLink(e.target.value)} placeholder="https://upwork.com/…" />
            </Field>
          </div>
        </div>

        <div style={divider} />

        {/* ── RATING ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionLabel}>Rating</div>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* ── STATUS ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={sectionLabel}>Status</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(status === s ? "" : s)}
                style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: "1px solid", fontFamily: "inherit",
                  borderColor: status === s ? "#f59e0b" : "#e5e7eb",
                  background: status === s ? "#fef3c7" : "#fff",
                  color: status === s ? "#92400e" : "#6b7280",
                  fontWeight: status === s ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── TOOLS ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Tools used</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOOLS_LIST.map((t) => (
              <button
                key={t}
                onClick={() => toggleTool(t)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: "1px solid", fontFamily: "inherit",
                  borderColor: tools.has(t) ? "#3b82f6" : "#e5e7eb",
                  background: tools.has(t) ? "#eff6ff" : "#fff",
                  color: tools.has(t) ? "#1d4ed8" : "#6b7280",
                  fontWeight: tools.has(t) ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={divider} />

        {/* ── SCREENSHOTS (not profile — that's from Client relation) ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Screenshots</div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12, marginTop: -4 }}>
            Client profile photo comes from the Client relation above. Upload feedback screenshots here.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <UploadZone
              label="Feedback screenshot"
              hint="Edited/cropped · JPG PNG WEBP"
              emoji="📸"
              preview={screenshotPreview}
              onChange={(f) => { setScreenshotFile(f); setScreenshotPreview(f ? URL.createObjectURL(f) : null); }}
            />
            <UploadZone
              label="Raw screenshot"
              hint="Original unedited · any image"
              emoji="🗂️"
              preview={rawPreview}
              onChange={(f) => { setRawFile(f); setRawPreview(f ? URL.createObjectURL(f) : null); }}
            />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            padding: "12px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13,
            background: result.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: result.type === "success" ? "#15803d" : "#dc2626",
            border: `1px solid ${result.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          }}>
            {result.msg}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
          <button
            onClick={handleReset}
            style={{ padding: "8px 18px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, background: "transparent", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "8px 22px", fontSize: 13, border: "none", borderRadius: 8,
              background: submitting ? "#9ca3af" : "#111827",
              color: "#fff", cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 500, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {submitting ? "⏳ Submitting…" : "🚀 Submit testimonial"}
          </button>
        </div>
      </div>
    </div>
  );
}