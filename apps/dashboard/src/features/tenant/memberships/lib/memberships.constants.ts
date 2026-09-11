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
