/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const STOCK_MOVEMENTS_ENDPOINT = "/stock-movements";

/** Tamaño de página por defecto del listado de movimientos de stock. */
export const STOCK_MOVEMENTS_PER_PAGE = 15;

/** Origen del movimiento. Ninguna pantalla de este módulo los genera: son solo lectura. */
export const STOCK_MOVEMENT_TYPES = ["compra", "venta", "anulacion_venta", "ajuste"] as const;
