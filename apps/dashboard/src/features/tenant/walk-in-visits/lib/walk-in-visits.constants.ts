/** Rutas del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const WALK_IN_VISITS_ENDPOINT = "/walk-in-visits";
export const WALK_IN_VISITS_REPORT_ENDPOINT = "/walk-in-visits/report";
export const branchDayPassEndpoint = (branchId: string | number) =>
  `/branches/${encodeURIComponent(branchId)}/day-pass`;

export const WALK_IN_VISITS_PER_PAGE = 15;

export const VISITS_REGISTER_ANONYMOUS_PERMISSION = "visits.register_anonymous";
/** Cobrar y devolver un pase de día se rigen por el permiso de caja. */
export const DAY_PASS_CHARGE_PERMISSION = "cash_register.add_movement";

export const VISIT_TYPES = ["day_pass", "class"] as const;
export const VISIT_TYPE_LABELS: Record<(typeof VISIT_TYPES)[number], string> = {
  day_pass: "Pase de día",
  class: "Clase suelta",
};

/** Métodos que acepta el cobro de visitas (subconjunto de los de caja). */
export const VISIT_PAYMENT_METHODS = ["cash", "yape", "plin", "transfer", "pos"] as const;
