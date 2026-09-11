/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const SUBSCRIPTIONS_ENDPOINT = "/subscriptions";

/** Tamaño de página por defecto del list de suscripciones. */
export const SUBSCRIPTIONS_PER_PAGE = 10;

/** Estados admitidos por el backend (`StoreSubscriptionRequest.status`). */
export const SUBSCRIPTION_STATUSES = [
  "active",
  "trial",
  "cancelled",
  "expired",
] as const;

/** Etiqueta legible de cada estado. */
export const SUBSCRIPTION_STATUS_LABELS: Record<
  (typeof SUBSCRIPTION_STATUSES)[number],
  string
> = {
  active: "Activa",
  trial: "Prueba",
  cancelled: "Cancelada",
  expired: "Expirada",
};
