/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const MEMBERSHIPS_ENDPOINT = "/memberships";

/** Tamaño de página por defecto del list de membresías. */
export const MEMBERSHIPS_PER_PAGE = 10;

/** Estados admitidos por el backend (`UpdateMembershipRequest.status`). */
export const MEMBERSHIP_STATUSES = [
  "active",
  "expired",
  "cancelled",
  "pending",
] as const;

/** Etiqueta legible de cada estado. */
export const MEMBERSHIP_STATUS_LABELS: Record<
  (typeof MEMBERSHIP_STATUSES)[number],
  string
> = {
  active: "Activa",
  expired: "Expirada",
  cancelled: "Cancelada",
  pending: "Pendiente",
};

/** Estado inicial admitido por el backend al crear (`StoreMembershipRequest.status`). */
export const MEMBERSHIP_CREATE_STATUSES = ["active", "pending"] as const;

/**
 * Cambios de estado permitidos al editar (espejo de
 * `UpdateMembershipRequest::ALLOWED_TRANSITIONS`). "Expirada" la pone el
 * sistema al vencer, y una cancelada/expirada no se reactiva: se crea otra.
 */
export const MEMBERSHIP_STATUS_TRANSITIONS: Record<
  (typeof MEMBERSHIP_STATUSES)[number],
  readonly (typeof MEMBERSHIP_STATUSES)[number][]
> = {
  pending: ["active", "cancelled"],
  active: ["cancelled"],
  expired: [],
  cancelled: [],
};

/** Ventana para la fecha de inicio (igual que `StoreMembershipRequest`). */
export const MEMBERSHIP_START_MAX_DAYS_IN_PAST = 7;
export const MEMBERSHIP_START_MAX_DAYS_IN_FUTURE = 30;
