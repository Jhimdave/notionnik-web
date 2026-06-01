import { useState, useEffect } from "react";
import {
  T, TOOLS_OPTIONS, FEATURES_OPTIONS, CORE_PROP_NAMES,
  BASE_URL, ADMIN_KEY,
  inputStyle, sectionLabel, divider,
} from "./constants";
import { statusStyle, extractAnyProp } from "./helper";
import { Field, PillToggle, UploadZone, AlertBox, DynamicCell } from "./primitives";


// ── People picker — own component so hooks are always called ──────
function PeoplePicker({ name, value, onChange }) {
  const existing       = Array.isArray(value) ? value : [];
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [selected, setSelected] = useState(() => existing.map(p => p.id ?? p));

  useEffect(() => {
    fetch(`${BASE_URL}/admin/notion-users`, { headers: { "x-api-key": ADMIN_KEY } })
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(userId) {
    const next = selected.includes(userId)
      ? selected.filter(id => id !== userId)
      : [...selected, userId];
    setSelected(next);
    onChange(next);
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Field label={name}>
      {loading ? (
        <div style={{ fontSize: 11, color: T.textMuted, padding: "8px 0" }}>Loading workspace members…</div>
      ) : (
        <div style={{ border: `1px solid ${T.borderStrong}`, borderRadius: 8, overflow: "hidden" }}>
          <input
            style={{ ...inputStyle, borderRadius: 0, borderBottom: `1px solid ${T.borderStrong}`, margin: 0 }}
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: 11, color: T.textMuted }}>No members found.</div>
            )}
            {filtered.map(u => {
              const isSelected = selected.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", cursor: "pointer",
                    background: isSelected ? "rgba(59,130,246,0.1)" : "transparent",
                    borderBottom: `1px solid ${T.border}`,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name}
                      style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.blueDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.blue, fontWeight: 700, flexShrink: 0 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: isSelected ? 600 : 400 }}>{u.name}</div>
                    {u.email && <div style={{ fontSize: 10, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>}
                  </div>
                  {isSelected && <span style={{ color: T.blue, fontSize: 14, flexShrink: 0 }}>✓</span>}
                </div>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ padding: "6px 12px", fontSize: 10, color: T.blue, background: "rgba(59,130,246,0.06)", borderTop: `1px solid ${T.border}` }}>
              {selected.length} member{selected.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      )}
    </Field>
  );
}


// ── Files field — own component so hooks are always called ────────
function FilesField({ name, value, onFileChange }) {
  const existingUrl = Array.isArray(value) ? value[0] : value;
  const [fileObj, setFileObj] = useState(null);
  const [preview, setPreview] = useState(null);
  const isImage = (url) => url && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url);

  function handleFile(f) {
    setFileObj(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    onFileChange?.(name, f);
  }

  return (
    <Field label={name}>
      {existingUrl && !preview && (
        <div style={{ marginBottom: 8 }}>
          {isImage(existingUrl) ? (
            <img src={existingUrl} alt={name}
              style={{ maxHeight: 80, maxWidth: "100%", borderRadius: 6, border: `1px solid ${T.borderStrong}`, objectFit: "contain", background: "rgba(0,0,0,0.3)", padding: 4 }} />
          ) : (
            <a href={existingUrl} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: T.blue, wordBreak: "break-all" }}>
              📎 View existing file
            </a>
          )}
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>
            Existing file — upload below to replace
          </div>
        </div>
      )}
      {preview && (
        <div style={{ marginBottom: 8 }}>
          <img src={preview} alt="preview"
            style={{ maxHeight: 80, maxWidth: "100%", borderRadius: 6, border: `1px solid ${T.borderStrong}`, objectFit: "contain", background: "rgba(0,0,0,0.3)", padding: 4 }} />
          <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4 }}>✓ New file selected</div>
        </div>
      )}
      <UploadZone
        label={existingUrl ? "Replace file" : `Upload ${name}`}
        hint="Any image or file"
        emoji="📎"
        preview={null}
        onChange={handleFile}
      />
      {fileObj && (
        <button
          onClick={() => { setFileObj(null); setPreview(null); onFileChange?.(name, null); }}
          style={{ marginTop: 4, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
          × Clear new file
        </button>
      )}
    </Field>
  );
}


// ── Dynamic field editor ──────────────────────────────────────────
function DynamicField({ prop, value, onChange, onFileChange }) {
  const { name, type, options: propOptions = [] } = prop;

  if (type === "files") {
    return <FilesField name={name} value={value} onFileChange={onFileChange} />;
  }

  if (type === "people") {
    return <PeoplePicker name={name} value={value} onChange={onChange} />;
  }

  if (type === "multi_select") {
    const available = propOptions.map(o => o.name);
    const selected  = Array.isArray(value) ? value : [];
    return (
      <Field label={name}>
        {available.length > 0 ? (
          <PillToggle
            options={available}
            selected={selected}
            onToggle={opt => {
              const next = selected.includes(opt)
                ? selected.filter(v => v !== opt)
                : [...selected, opt];
              onChange(next);
            }}
            activeColor="#a78bfa"
            activeBg="rgba(167,139,250,0.1)"
          />
        ) : (
          <input
            style={inputStyle}
            value={selected.join(", ")}
            onChange={e => onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="comma-separated values…"
          />
        )}
      </Field>
    );
  }

  if (type === "select") {
    const available = propOptions.map(o => o.name);
    return (
      <Field label={name}>
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        >
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
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: T.blue, cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, color: T.textSecond }}>{value ? "Enabled" : "Disabled"}</span>
        </label>
      </Field>
    );
  }

  if (type === "number") {
    return (
      <Field label={name}>
        <input
          type="number"
          style={inputStyle}
          value={value ?? ""}
          onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder="0"
        />
      </Field>
    );
  }

  if (type === "date") {
    return (
      <Field label={name}>
        <input
          type="date"
          style={{ ...inputStyle, colorScheme: "dark" }}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        />
      </Field>
    );
  }

  if (type === "url") {
    return (
      <Field label={name}>
        <input
          type="url"
          style={inputStyle}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="https://…"
        />
      </Field>
    );
  }

  if (type === "email") {
    return (
      <Field label={name}>
        <input
          type="email"
          style={inputStyle}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="name@example.com"
        />
      </Field>
    );
  }

  if (type === "phone_number") {
    return (
      <Field label={name}>
        <input
          type="tel"
          style={inputStyle}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </Field>
    );
  }

  // Rich text / fallback
  return (
    <Field label={name}>
      <input
        style={inputStyle}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={`Enter ${name.toLowerCase()}…`}
      />
    </Field>
  );
}


// ── Service Form ──────────────────────────────────────────────────
export function ServiceForm({ mode = "create", initial = {}, dbProps = [], onSubmit, onCancel, submitting, result }) {
  const [title,              setTitle]    = useState(initial.title              || "");
  const [serviceHeader,      setHeader]   = useState(initial.serviceHeader      || "");
  const [serviceDescription, setDesc]     = useState(initial.serviceDescription || "");
  const [tools,              setTools]    = useState(new Set(initial.tools      || []));
  const [features,           setFeatures] = useState(new Set(initial.features   || []));
  const [logoFile,           setLogoFile] = useState(null);
  const [logoPreview,        setLogoPreview] = useState(null);

  const extraProps = dbProps.filter(p => !CORE_PROP_NAMES.has(p.name) && p.type !== "title");

  const [dynValues,   setDynValues]   = useState(() => buildInitialDyn(extraProps, initial));
  const [dynFileObjs, setDynFileObjs] = useState({});

  useEffect(() => {
    setDynValues(buildInitialDyn(extraProps, initial));
    setDynFileObjs({});
    setTitle(initial.title              || "");
    setHeader(initial.serviceHeader     || "");
    setDesc(initial.serviceDescription  || "");
    setTools(new Set(initial.tools      || []));
    setFeatures(new Set(initial.features || []));
    setLogoFile(null);
    setLogoPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.id]);

  function buildInitialDyn(props, item) {
    const init = {};
    props.forEach(p => {
      const raw = item._raw?.[p.name];
      init[p.name] = raw !== undefined ? (extractAnyProp(raw) ?? "") : "";
    });
    return init;
  }

  function setDyn(name, val)         { setDynValues(prev  => ({ ...prev, [name]: val })); }
  function setDynFile(name, fileObj) { setDynFileObjs(prev => ({ ...prev, [name]: fileObj })); }
  function toggleTool(t)    { setTools(prev    => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; }); }
  function toggleFeature(f) { setFeatures(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; }); }

  function handleSubmit() {
    onSubmit({ title, serviceHeader, serviceDescription, tools, features, logoFile, dynValues, dynFileObjs });
  }

  const isEdit = mode === "edit";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Service details</div>
        <Field label="Title" required>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Notion Workspaces" />
        </Field>
        <Field label="Service Header" hint="Short tagline shown in cards">
          <input style={inputStyle} value={serviceHeader} onChange={e => setHeader(e.target.value)} placeholder="e.g. Your entire business, beautifully organized in Notion." />
        </Field>
        <Field label="Service Description" hint="Longer description">
          <textarea
            value={serviceDescription}
            onChange={e => setDesc(e.target.value)}
            style={{ ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6 }}
            placeholder="We design and build customized Notion systems that…"
          />
        </Field>
      </div>

      <div style={divider} />

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Tools</div>
        <PillToggle options={TOOLS_OPTIONS} selected={[...tools]} onToggle={toggleTool} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Features</div>
        <PillToggle options={FEATURES_OPTIONS} selected={[...features]} onToggle={toggleFeature} activeColor="#a78bfa" activeBg="rgba(167,139,250,0.1)" />
      </div>

      {extraProps.length > 0 && (
        <>
          <div style={divider} />
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...sectionLabel, color: "#a78bfa", display: "flex", alignItems: "center", gap: 5 }}>
              <span>✦</span> Additional properties
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              {extraProps.map(p => (
                <DynamicField
                  key={p.name}
                  prop={p}
                  value={dynValues[p.name]}
                  onChange={val => setDyn(p.name, val)}
                  onFileChange={(name, file) => setDynFile(name, file)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div style={divider} />

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Logo / Icon</div>
        <UploadZone
          label="Upload service logo"
          hint="PNG WEBP SVG · transparent background ideal"
          emoji="🖼️"
          preview={logoPreview}
          onChange={f => { setLogoFile(f); setLogoPreview(f ? URL.createObjectURL(f) : null); }}
        />
        {logoFile && (
          <button
            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
            style={{ marginTop: 4, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
            × Clear
          </button>
        )}
      </div>

      <AlertBox result={result} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", fontSize: 12, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting} style={{ padding: "8px 20px", fontSize: 12, border: "none", borderRadius: 7, background: submitting ? "#4b5563" : T.blue, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
          {submitting ? "⏳ Saving…" : isEdit ? "💾 Save changes" : "🚀 Create service"}
        </button>
      </div>
    </div>
  );
}


// ── View / Edit Modal ─────────────────────────────────────────────
export default function EditModal({ item, dbProps, onClose, onDelete, onSave, editSubmitting, editResult }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => { setIsEditing(false); }, [item.id]);

  const ss         = statusStyle(item.status);
  const extraProps = dbProps.filter(p => !CORE_PROP_NAMES.has(p.name) && p.type !== "title");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,7,20,0.85)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.borderStrong}`, borderRadius: 16, width: "100%", maxWidth: 600, zIndex: 1, animation: "modalIn 0.2s ease", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.navyDeep, borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textPrimary, display: "flex", alignItems: "center", gap: 10 }}>
            {item.logo && <img src={item.logo} alt="" style={{ width: 26, height: 26, objectFit: "contain", borderRadius: 4 }} />}
            {item.title || "Service"}
          </h3>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)}
                  style={{ padding: "5px 12px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: T.blueDim, color: T.blue, cursor: "pointer", fontFamily: "inherit" }}>
                  ✏️ Edit
                </button>
                <button onClick={() => { onClose(); onDelete(item); }}
                  style={{ padding: "5px 12px", fontSize: 11, border: "1px solid rgba(239,68,68,0.35)", borderRadius: 7, background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontFamily: "inherit" }}>
                  🗑️ Delete
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(false)}
                style={{ padding: "5px 12px", fontSize: 11, border: `1px solid ${T.borderStrong}`, borderRadius: 7, background: "transparent", color: T.textSecond, cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.textMuted, lineHeight: 1, marginLeft: 2 }}>×</button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px 22px" }}>

          {/* ════ VIEW MODE ════ */}
          {!isEditing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: T.blueDim, borderRadius: 10, border: `1px solid ${T.border}` }}>
                {item.logo
                  ? <img src={item.logo} alt={item.title} style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: `1px solid ${T.borderStrong}`, padding: 4 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${T.borderStrong}` }}>🔧</div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: T.textSecond, marginTop: 3 }}>{item.serviceHeader || "—"}</div>
                </div>
                {item.status && (
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, whiteSpace: "nowrap" }}>
                    {item.status}
                  </span>
                )}
              </div>

              {item.serviceDescription && (
                <div>
                  <div style={sectionLabel}>Description</div>
                  <div style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.75, background: "rgba(0,7,20,0.4)", borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                    {item.serviceDescription}
                  </div>
                </div>
              )}

              {item.tools?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Tools</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {item.tools.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, background: T.blueDim, color: "#7eb3fa", border: `1px solid ${T.borderStrong}` }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.features?.length > 0 && (
                <div>
                  <div style={sectionLabel}>Features</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {item.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.textSecond }}>
                        <span style={{ color: "#a78bfa", fontSize: 10 }}>▸</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extraProps.length > 0 && (
                <div>
                  <div style={divider} />
                  <div style={{ ...sectionLabel, color: "#a78bfa", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>✦</span> Additional properties
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {extraProps.map(p => {
                      const val = extractAnyProp(item._raw?.[p.name]);
                      return (
                        <div key={p.name}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{p.name}</div>
                          <DynamicCell value={val} type={p.type} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ EDIT MODE ════ */}
          {isEditing && (
            <ServiceForm
              mode="edit"
              initial={item}
              dbProps={dbProps}
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