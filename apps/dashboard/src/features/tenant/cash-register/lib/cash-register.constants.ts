/** Rutas del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const CASH_REGISTER_CURRENT_ENDPOINT = "/cash-register/current";
export const CASH_REGISTER_OPEN_ENDPOINT = "/cash-register/open";
export const CASH_REGISTER_CLOSE_ENDPOINT = "/cash-register/close";
export const CASH_REGISTERS_ENDPOINT = "/cash-registers";
export const CASH_MOVEMENTS_ENDPOINT = "/cash-movements";

/** Tamaño de página del historial de cajas y de los listados de movimientos. */
export const CASH_REGISTERS_PER_PAGE = 15;
export const CASH_MOVEMENTS_PER_PAGE = 20;

/** Métodos de pago admitidos por un movimiento de caja (`CashMovement::PAYMENT_METHODS`). */
export const CASH_PAYMENT_METHODS = [
  "cash",
  "transfer",
  "yape",
  "plin",
  "pos",
  "culqi_card",
  "culqi_yape",
  "other",
] as const;

export const CASH_PAYMENT_METHOD_LABELS: Record<(typeof CASH_PAYMENT_METHODS)[number], string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  yape: "Yape",
  plin: "Plin",
  pos: "POS / Tarjeta",
  culqi_card: "Tarjeta (Culqi)",
  culqi_yape: "Yape (Culqi)",
  other: "Otro",
};

export function cashPaymentMethodLabel(method: string): string {
  return CASH_PAYMENT_METHOD_LABELS[method as (typeof CASH_PAYMENT_METHODS)[number]] ?? method;
}

/** Categorías de ingreso manual (`CashMovement::INCOME_CATEGORIES`). */
export const CASH_INCOME_CATEGORIES = [
  "membership_payment",
  "membership_renewal",
  "inscription_fee",
  "product_sale",
  "service_fee",
  "other_income",
] as const;

export const CASH_INCOME_CATEGORY_LABELS: Record<(typeof CASH_INCOME_CATEGORIES)[number], string> = {
  membership_payment: "Pago de membresía",
  membership_renewal: "Renovación de membresía",
  inscription_fee: "Cuota de inscripción",
  product_sale: "Venta de producto",
  service_fee: "Cargo por servicio",
  other_income: "Otro ingreso",
};

/** Categorías de egreso manual (`CashMovement::EXPENSE_CATEGORIES`). */
export const CASH_EXPENSE_CATEGORIES = [
  "supply",
  "maintenance",
  "utility",
  "cleaning",
  "marketing",
  "salary_advance",
  "petty_cash",
  "withdrawal",
  "bank_deposit",
  "other_expense",
] as const;

export const CASH_EXPENSE_CATEGORY_LABELS: Record<(typeof CASH_EXPENSE_CATEGORIES)[number], string> = {
  supply: "Insumos",
  maintenance: "Mantenimiento",
  utility: "Servicios",
  cleaning: "Limpieza",
  marketing: "Marketing",
  salary_advance: "Adelanto de sueldo",
  petty_cash: "Caja chica",
  withdrawal: "Retiro",
  bank_deposit: "Depósito bancario",
  other_expense: "Otro egreso",
};

export function cashCategoryLabel(category: string | null): string {
  if (!category) return "—";
  return (
    CASH_INCOME_CATEGORY_LABELS[category as (typeof CASH_INCOME_CATEGORIES)[number]] ??
    CASH_EXPENSE_CATEGORY_LABELS[category as (typeof CASH_EXPENSE_CATEGORIES)[number]] ??
    category
  );
}

/** Estados de una caja (`CashRegister::STATUSES`). */
export const CASH_REGISTER_STATUSES = ["open", "closed"] as const;

export const CASH_REGISTER_STATUS_LABELS: Record<(typeof CASH_REGISTER_STATUSES)[number], string> = {
  open: "Abierta",
  closed: "Cerrada",
};

/** `Intl.NumberFormat` compartido: los montos de caja viajan en soles, no en céntimos. */
const SOLES_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function formatSoles(amount: number): string {
  return Number.isFinite(amount) ? SOLES_FORMATTER.format(amount) : "—";
}
