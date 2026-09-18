/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const CLASS_SESSIONS_ENDPOINT = "/class-sessions";

export const CLASS_SESSIONS_PER_PAGE = 15;

/** Estados admitidos por el backend (`UpdateClassSessionRequest.status`). */
export const CLASS_SESSION_STATUSES = ["scheduled", "cancelled", "completed"] as const;

/** Etiqueta legible de cada estado. */
export const CLASS_SESSION_STATUS_LABELS: Record<(typeof CLASS_SESSION_STATUSES)[number], string> = {
  scheduled: "Programada",
  cancelled: "Cancelada",
  completed: "Completada",
};
