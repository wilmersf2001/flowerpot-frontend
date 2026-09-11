/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const PLANS_ENDPOINT = "/plans";

/** Tamaño de página por defecto del list de planes. */
export const PLANS_PER_PAGE = 10;

/** Identificador comercial del plan: minúsculas, números y guion. */
export const PLAN_SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Periodos de facturación admitidos por el backend. */
export const PLAN_BILLING_PERIODS = ["monthly", "yearly"] as const;

/** Etiqueta legible de cada periodo de facturación. */
export const PLAN_BILLING_PERIOD_LABELS: Record<
  (typeof PLAN_BILLING_PERIODS)[number],
  string
> = {
  monthly: "Mensual",
  yearly: "Anual",
};
