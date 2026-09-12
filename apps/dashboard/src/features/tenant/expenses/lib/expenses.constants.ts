/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const EXPENSES_ENDPOINT = "/expenses";

/** Tamaño de página del listado de gastos. */
export const EXPENSES_PER_PAGE = 15;

/** Métodos de pago admitidos por el alta de gasto (`StoreExpenseRequest`). */
export const EXPENSE_PAYMENT_METHODS = ["cash", "card", "transfer", "check", "other"] as const;

export const EXPENSE_PAYMENT_METHOD_LABELS: Record<
  (typeof EXPENSE_PAYMENT_METHODS)[number],
  string
> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  check: "Cheque",
  other: "Otro",
};

export function expensePaymentMethodLabel(method: string): string {
  return EXPENSE_PAYMENT_METHOD_LABELS[method as (typeof EXPENSE_PAYMENT_METHODS)[number]] ?? method;
}

/** Estados del ciclo de vida de un gasto (`Expense::STATUSES`). */
export const EXPENSE_STATUSES = ["pending", "approved", "rejected", "voided"] as const;

export const EXPENSE_STATUS_LABELS: Record<(typeof EXPENSE_STATUSES)[number], string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  voided: "Anulado",
};

/** `Intl.NumberFormat` compartido: los montos de gasto viajan en soles, no en céntimos. */
const SOLES_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function formatSoles(amount: number): string {
  return Number.isFinite(amount) ? SOLES_FORMATTER.format(amount) : "—";
}
