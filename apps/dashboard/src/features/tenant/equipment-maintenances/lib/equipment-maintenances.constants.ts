/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const EQUIPMENT_MAINTENANCES_ENDPOINT = "/equipment-maintenances";

/** Tamaño de página por defecto del listado de mantenimientos. */
export const EQUIPMENT_MAINTENANCES_PER_PAGE = 15;

/**
 * `preventivo` nace `programado` (requiere `scheduled_date`); `correctivo`
 * nace directo `en_progreso` y pone el equipo en `en_mantenimiento` al crearse.
 */
export const EQUIPMENT_MAINTENANCE_TYPES = ["preventivo", "correctivo"] as const;

/** Métodos de pago al completar. `cash` genera movimiento en caja (requiere caja abierta). */
export const EQUIPMENT_MAINTENANCE_PAYMENT_METHODS = [
  "cash",
  "card",
  "transfer",
  "check",
  "other",
] as const;

export const EQUIPMENT_MAINTENANCE_PAYMENT_METHOD_LABELS: Record<
  (typeof EQUIPMENT_MAINTENANCE_PAYMENT_METHODS)[number],
  string
> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  check: "Cheque",
  other: "Otro",
};

/**
 * `programado -> en_progreso -> completado`, o `programado -> cancelado`.
 * `completado -> cancelado` también es válido (revierte el movimiento de caja).
 * Un mantenimiento `en_progreso` no se puede cancelar, solo completar.
 * No se puede iniciar antes de su `scheduled_date`.
 */
export const EQUIPMENT_MAINTENANCE_STATUSES = [
  "programado",
  "en_progreso",
  "completado",
  "cancelado",
] as const;
