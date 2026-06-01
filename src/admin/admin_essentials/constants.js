export const BASE_URL   = "https://niknotion-admin.onrender.com" ||import.meta.env.VITE_ADMIN_API;
export const ADMIN_KEY  = import.meta.env.VITE_API_CLIENT_KEY;
export const PUBLIC_KEY = import.meta.env.VITE_API_SECRET;

export const T = {
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

// ── Services options ──────────────────────────────────────────────
export const TOOLS_OPTIONS = [
  "Notion","Notion API","Automation","Zapier","Make","Airtable",
  "Go High Level","Google App Script","CRM","Slack","React",
  "TailwindCSS","Framer","Webflow","TypeScript","Node.js",
];

export const FEATURES_OPTIONS = [
  "Custom database architecture","Linked databases & relations",
  "Filtered views per team role","Template systems",
  "Automated workflows","API integration","Real-time sync",
  "Custom dashboard","Onboarding flow","Reporting & analytics",
  "Multi-workspace setup","Permission management",
];

// ── Testimonial options ───────────────────────────────────────────
export const CATEGORIES = [
  "Notion x Automation","Notion Setup","Google App Script",
  "Consultation","Website Development","Automation",
];

export const TOOLS_LIST = [
  "Notion","Automation","Google App Script","Zapier","Make",
  "Airtable","Go High Level","CRM","Slack","React","TailwindCSS",
];

export const STATUSES = [
  "To Gather Data","Screenshot Editing","Data Gathering",
  "Screenshot Edited","Approved",
];

// ── Shared ────────────────────────────────────────────────────────
export const PROPERTY_TYPES = [
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

export const NOTION_COLORS = [
  "default","gray","brown","orange","yellow","green","blue","purple","pink","red",
];

export const COLOR_DOTS = {
  default:"#9ca3af", gray:"#6b7280", brown:"#92400e", orange:"#c2410c",
  yellow:"#b45309",  green:"#16a34a", blue:"#1d4ed8",  purple:"#7c3aed",
  pink:"#be185d",    red:"#dc2626",
};

export const STATUS_COLORS = {
  "Open":       { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.3)",   color:"#4ade80" },
  "Coming Soon":{ bg:"rgba(234,179,8,0.1)",   border:"rgba(234,179,8,0.3)",   color:"#facc15" },
  "Closed":     { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   color:"#f87171" },
  "Draft":      { bg:"rgba(100,116,139,0.12)",border:"rgba(100,116,139,0.3)", color:"#94a3b8" },
};

export const CORE_PROP_NAMES = new Set([
  // Services core
  "Title","Service Header","Service Description","Logo","Tools","Features","Status",
  // Testimonials core
  "Feedback ","Feedback","Client","Contract Title","Project Title",
  "Category","Rate","Status","Tools","Credibility link",
  "Feedback Screenshot","Raw Screenshot","Client Profile",
  "Display Name","Company","Client Role","Reviewer Role",
]);

export const inputStyle = {
  width:"100%", fontSize:13, padding:"7px 10px",
  border:`1px solid rgba(59,130,246,0.35)`, borderRadius:7,
  background:"#051229", color:"#e8edf8", outline:"none",
  boxSizing:"border-box", fontFamily:"inherit",
};

export const sectionLabel = {
  fontSize:10, fontWeight:700, color:"#4d6fa0",
  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8,
};

export const divider = { height:1, background:"rgba(59,130,246,0.18)", margin:"16px 0" };