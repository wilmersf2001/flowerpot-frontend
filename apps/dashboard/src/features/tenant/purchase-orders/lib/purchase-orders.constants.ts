/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const PURCHASE_ORDERS_ENDPOINT = "/purchase-orders";

/** Tamaño de página por defecto del listado de órdenes de compra. */
export const PURCHASE_ORDERS_PER_PAGE = 15;

/**
 * Estados de una orden de compra. `cancelled` es un valor válido en la base
 * pero no existe ningún endpoint que lo produzca; se cubre solo por si
 * apareciera un dato histórico con ese estado.
 */
export const PURCHASE_ORDER_STATUSES = ["pending", "received", "cancelled"] as const;
