/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const SALES_ENDPOINT = "/sales";

/** Tamaño de página por defecto del listado de ventas. */
export const SALES_PER_PAGE = 15;

export const SALE_PAYMENT_METHODS = ["efectivo", "yape", "plin", "transferencia"] as const;

export const SALE_STATUSES = ["completed", "voided"] as const;

export const SALE_PAYMENT_METHOD_LABELS: Record<(typeof SALE_PAYMENT_METHODS)[number], string> = {
  efectivo: "Efectivo",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
};
