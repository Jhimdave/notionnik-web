import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://api.notionnik.com";
const API_KEY  = "notionnik2026itsolutions";

// ── Helpers ───────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? "");
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return "—"; }
}

function StatusBadge({ status }) {
  const styles = {
    Done:               { background: "#EAF3DE", color: "#3B6D11" },
    "Screenshot Editing":{ background: "#FAEEDA", color: "#854F0B" },
    "To Gather Data":   { background: "#E6F1FB", color: "#185FA5" },
  };
  const s = styles[status] ?? { background: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
      ...s,
    }}>
      {status ?? "—"}
    </span>
  );
}

function Stars({ value }) {
  const n = Number(value ?? 0);
  if (!n) return <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>;
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#F59E0B" : "#D1D5DB", fontSize: 13 }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3 }}>{n}/5</span>
    </span>
  );
}

function Avatar({ client }) {
  if (client?.avatar) {
    return (
      <img
        src={client.avatar}
        alt={client.name ?? ""}
        style={{
          width: 26, height: 26, borderRadius: "50%",
          objectFit: "cover", marginRight: 7, flexShrink: 0,
          border: "1px solid #E5E7EB",
        }}
      />
    );
  }
  const init = (client?.name ?? "?")[0]?.toUpperCase() ?? "?";
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%",
      background: "#E6F1FB", color: "#185FA5",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 500, marginRight: 7, flexShrink: 0,
    }}>
      {init}
    </div>
  );
}

function ToolPills({ tools }) {
  if (!tools?.length) return <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>;
  return (
    <span>
      {tools.slice(0, 3).map(t => (
        <span key={t} style={{
          display: "inline-flex", alignItems: "center",
          padding: "1px 7px", borderRadius: 20, fontSize: 11,
          background: "#F3F4F6", color: "#6B7280",
          border: "1px solid #E5E7EB", marginRight: 3,
        }}>
          {t}
        </span>
      ))}
      {tools.length > 3 && (
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "1px 7px", borderRadius: 20, fontSize: 11,
          background: "#F3F4F6", color: "#6B7280",
          border: "1px solid #E5E7EB",
        }}>
          +{tools.length - 3}
        </span>
      )}
    </span>
  );
}

// ── Column definitions ────────────────────────────────────────────

const COLUMNS = [
  { key: "clientName", label: "Client",    width: 170, sortable: true },
  { key: "feedback",   label: "Feedback",  width: 210, sortable: false },
  { key: "category",   label: "Category",  width: 140, sortable: true },
  { key: "rate",       label: "Rating",    width: 100, sortable: true },
  { key: "status",     label: "Status",    width: 130, sortable: true },
  { key: "tools",      label: "Tools",     width: 140, sortable: false },
  { key: "contractTitle", label: "Contract", width: 140, sortable: true },
  { key: "createdAt",  label: "Date",      width: 110, sortable: true },
  { key: "_link",      label: "",          width: 36,  sortable: false },
];

const STATUS_FILTERS = [
  { key: "all",               label: "All" },
  { key: "Done",              label: "Done" },
  { key: "Screenshot Editing",label: "Editing" },
  { key: "To Gather Data",    label: "Gather" },
];

// ── Main component ────────────────────────────────────────────────

export default function TestimonialsTable() {
  const [allData,      setAllData]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortCol,      setSortCol]      = useState("createdAt");
  const [sortDir,      setSortDir]      = useState(-1); // -1 = desc, 1 = asc

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/testimonials`, {
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const rows = Array.isArray(json)
        ? json
        : (json.data ?? json.testimonials ?? []);
      setAllData(rows);
    } catch (err) {
      setError(err.message ?? "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived: filtered + sorted ──────────────────────────────────
  const rows = (() => {
    let d = [...allData];

    if (filterStatus !== "all") {
      d = d.filter(r => r.status === filterStatus);
    }

    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r =>
        (r.client?.name ?? r.clientName ?? "").toLowerCase().includes(q) ||
        (r.feedback ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q) ||
        (r.contractTitle ?? "").toLowerCase().includes(q) ||
        (r.client?.company ?? "").toLowerCase().includes(q)
      );
    }

    d.sort((a, b) => {
      let va, vb;
      switch (sortCol) {
        case "clientName":
          va = a.client?.name ?? ""; vb = b.client?.name ?? ""; break;
        case "rate":
          va = Number(a.rate ?? a.rating ?? 0);
          vb = Number(b.rate ?? b.rating ?? 0); break;
        case "createdAt":
          va = new Date(a.createdAt ?? a.created_at ?? 0);
          vb = new Date(b.createdAt ?? b.created_at ?? 0); break;
        default:
          va = a[sortCol] ?? ""; vb = b[sortCol] ?? "";
      }
      if (va < vb) return sortDir;
      if (va > vb) return -sortDir;
      return 0;
    });

    return d;
  })();

  function handleSort(col) {
    if (!COLUMNS.find(c => c.key === col)?.sortable) return;
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d * -1);
      else setSortDir(-1);
      return col;
    });
  }

  // ── Styles ──────────────────────────────────────────────────────

  const cell = {
    padding: "9px 12px",
    color: "#111827",
    verticalAlign: "middle",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 13,
    borderBottom: "1px solid #F3F4F6",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "1.5rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>Testimonials</h1>
            {!loading && (
              <span style={{
                fontSize: 12, background: "#F3F4F6", color: "#6B7280",
                borderRadius: 20, padding: "1px 10px", marginLeft: 4,
              }}>
                {rows.length}
              </span>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              height: 32, padding: "0 12px", fontSize: 13,
              border: "1px solid #E5E7EB", borderRadius: 8,
              background: "#FFF", color: "#6B7280", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "⏳" : "↻"} Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search testimonials…"
            style={{
              height: 32, fontSize: 13, padding: "0 10px",
              border: "1px solid #E5E7EB", borderRadius: 8,
              background: "#FFF", color: "#111827", outline: "none",
              width: 220, fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  height: 32, padding: "0 12px", fontSize: 13,
                  border: "1px solid",
                  borderColor: filterStatus === f.key ? "#D1D5DB" : "#E5E7EB",
                  borderRadius: 8,
                  background: filterStatus === f.key ? "#F3F4F6" : "#FFF",
                  color: filterStatus === f.key ? "#111827" : "#6B7280",
                  fontWeight: filterStatus === f.key ? 500 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 12,
            background: "#FEF2F2", color: "#DC2626",
            border: "1px solid #FECACA", fontSize: 13,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠ {error}
            <button
              onClick={fetchData}
              style={{ fontSize: 12, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: 12, background: "#FFF" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 13 }}>
            <colgroup>
              {COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      padding: "8px 12px",
                      background: "#F9FAFB",
                      color: "#6B7280",
                      fontWeight: 500,
                      fontSize: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #E5E7EB",
                      whiteSpace: "nowrap",
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {col.label}
                    {col.sortable && (
                      <span style={{
                        marginLeft: 4, fontSize: 11,
                        opacity: sortCol === col.key ? 1 : 0.4,
                        color: sortCol === col.key ? "#111827" : undefined,
                      }}>
                        {sortCol === col.key ? (sortDir === -1 ? "↓" : "↑") : "↕"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ ...cell, textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    Loading testimonials…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ ...cell, textAlign: "center", padding: "48px", color: "#9CA3AF" }}>
                    <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>🔍</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}>No testimonials found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or filter</div>
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const client = r.client ?? {};
                  return (
                    <tr
                      key={r.id ?? idx}
                      style={{ background: "#FFF", transition: "background 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#FFF")}
                    >
                      {/* Client */}
                      <td style={cell}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar client={client} />
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {esc(client.name ?? r.clientName ?? "—")}
                            </div>
                            {client.company && (
                              <div style={{ fontSize: 11, color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {esc(client.company)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Feedback */}
                      <td style={{ ...cell, color: "#6B7280" }} title={r.feedback ?? ""}>
                        {r.feedback ?? "—"}
                      </td>

                      {/* Category */}
                      <td style={{ ...cell, color: "#6B7280" }}>
                        {r.category ?? "—"}
                      </td>

                      {/* Rating */}
                      <td style={cell}>
                        <Stars value={r.rate ?? r.rating} />
                      </td>

                      {/* Status */}
                      <td style={cell}>
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Tools */}
                      <td style={cell}>
                        <ToolPills tools={r.tools} />
                      </td>

                      {/* Contract */}
                      <td style={{ ...cell, color: "#6B7280" }} title={r.contractTitle ?? ""}>
                        {r.contractTitle ?? "—"}
                      </td>

                      {/* Date */}
                      <td style={{ ...cell, color: "#9CA3AF" }}>
                        {fmtDate(r.createdAt ?? r.created_at)}
                      </td>

                      {/* Link */}
                      <td style={{ ...cell, textAlign: "center" }}>
                        {r.credibilityLink && (
                          <a
                            href={r.credibilityLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#9CA3AF", fontSize: 15, textDecoration: "none" }}
                            title="Credibility link"
                          >
                            ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && rows.length > 0 && (
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8, textAlign: "right" }}>
            {rows.length} record{rows.length !== 1 ? "s" : ""}
            {allData.length !== rows.length && ` (filtered from ${allData.length})`}
          </div>
        )}

      </div>
    </div>
  );
}