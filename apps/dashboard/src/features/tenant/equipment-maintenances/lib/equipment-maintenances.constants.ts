/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const EQUIPMENT_MAINTENANCES_ENDPOINT = "/equipment-maintenances";

/** Tamaño de página por defecto del listado de mantenimientos. */
export const EQUIPMENT_MAINTENANCES_PER_PAGE = 15;

/**
 * `preventivo` nace `programado` (requiere `scheduled_date`); `correctivo`
 * nace directo `en_progreso` y pone el equipo en `en_mantenimiento` al crearse.
 */
export const EQUIPMENT_MAINTENANCE_TYPES = ["preventivo", "correctivo"] as const;

/**
 * `programado -> en_progreso -> completado`, o `programado -> cancelado`.
 * Un mantenimiento `en_progreso` no se puede cancelar, solo completar.
 */
export const EQUIPMENT_MAINTENANCE_STATUSES = [
  "programado",
  "en_progreso",
  "completado",
  "cancelado",
] as const;
