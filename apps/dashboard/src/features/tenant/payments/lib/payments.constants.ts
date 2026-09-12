/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const PAYMENTS_ENDPOINT = "/payments";

/** Tamaño de página del listado de pagos. */
export const PAYMENTS_PER_PAGE = 20;

/**
 * Métodos de pago admitidos por el alta manual (`StorePaymentRequest` /
 * `StoreInstallmentRequest`). Se excluyen `culqi_card` / `culqi_yape`: esos
 * los genera el widget de Culqi (culqi.js) con un `culqi_token`, un flujo
 * aparte del registro manual (`payments.create_manual`).
 */
export const PAYMENT_METHODS = ["cash", "transfer", "yape", "plin", "pos"] as const;

export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
  pos: "POS / Tarjeta",
};

/** Etiqueta legible de cualquier método de pago, incluidos los de Culqi. */
const ALL_PAYMENT_METHOD_LABELS: Record<string, string> = {
  ...PAYMENT_METHOD_LABELS,
  culqi_card: "Tarjeta (Culqi)",
  culqi_yape: "Yape (Culqi)",
};

export function paymentMethodLabel(method: string): string {
  return ALL_PAYMENT_METHOD_LABELS[method] ?? method;
}

/** Etiqueta legible del gateway (`Payment::GATEWAYS`). */
export const PAYMENT_GATEWAY_LABELS: Record<string, string> = {
  manual: "Manual",
  culqi: "Culqi",
};

/** `Intl.NumberFormat` compartido: los montos de pago viajan en soles, no en céntimos. */
const SOLES_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function formatSoles(amount: number): string {
  return Number.isFinite(amount) ? SOLES_FORMATTER.format(amount) : "—";
}
