import { STATUS_COLORS } from "./constants";

// ── Status style ──────────────────────────────────────────────────
export function statusStyle(s) {
  return STATUS_COLORS[s] || { bg:"rgba(100,116,139,0.12)", border:"rgba(100,116,139,0.3)", color:"#94a3b8" };
}

// ── Extract Notion property values ────────────────────────────────
export const extractTitle       = p => p?.title?.map(t => t.plain_text).join("")      || "";
export const extractRichText    = p => p?.rich_text?.map(t => t.plain_text).join("")  || "";
export const extractSelect      = p => p?.select?.name                                || "";
export const extractMultiSelect = p => p?.multi_select?.map(o => o.name)             || [];
export const extractStatus      = p => p?.status?.name                               || "";
export const extractUrl         = p => p?.url                                         || "";
export const extractNumber      = p => p?.number                                      ?? null;
export const extractCheckbox    = p => p?.checkbox                                    ?? false;
export const extractDate        = p => p?.date?.start                                 || "";
export const extractFiles       = p =>
  p?.files?.map(f => f.type === "external" ? f.external?.url : f.file?.url).filter(Boolean) || [];

export function extractAnyProp(prop) {
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

// ── Normalise raw Notion page → flat service object ───────────────
export function normalisePage(page) {
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