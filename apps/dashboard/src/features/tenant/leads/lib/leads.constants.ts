/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const LEADS_ENDPOINT = "/leads";
export const LEADS_IMPORT_ENDPOINT = "/leads/import";
export const LEADS_IMPORT_TEMPLATE_ENDPOINT = "/leads/import/template";

export const LEADS_PER_PAGE = 15;

export const LEADS_CREATE_PERMISSION = "leads.create";
export const LEADS_EDIT_PERMISSION = "leads.edit";
export const LEADS_DELETE_PERMISSION = "leads.delete";
export const LEADS_FOLLOWUP_PERMISSION = "leads.manage_followup";
export const LEADS_CONVERT_PERMISSION = "leads.convert";
export const LEADS_IMPORT_PERMISSION = "leads.import";

export const LEAD_STATUSES = ["new", "contacted", "interested", "converted", "lost"] as const;
export const LEAD_STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: "Nuevo",
  contacted: "Contactado",
  interested: "Interesado",
  converted: "Convertido",
  lost: "Perdido",
};

export const LEAD_SOURCES = ["web", "widget", "manual", "walk_in", "import"] as const;
export const LEAD_SOURCE_LABELS: Record<(typeof LEAD_SOURCES)[number], string> = {
  web: "Web",
  widget: "Widget",
  manual: "Manual",
  walk_in: "Visita",
  import: "Importación",
};

/** Fuentes de la bandeja de captación (los visitantes son siempre `walk_in`). */
export const ACQUISITION_SOURCES = ["web", "widget", "manual", "import"] as const;

export const LEAD_INTERESTS = ["musculacion", "cardio", "clases", "artes_marciales", "otro"] as const;
export const LEAD_INTEREST_LABELS: Record<(typeof LEAD_INTERESTS)[number], string> = {
  musculacion: "Musculación",
  cardio: "Cardio",
  clases: "Clases",
  artes_marciales: "Artes marciales",
  otro: "Otro",
};

export const IMPORT_ISSUE_LABELS = {
  error: "Con errores",
  duplicate: "Duplicados",
  already_member: "Ya son socios",
} as const;
