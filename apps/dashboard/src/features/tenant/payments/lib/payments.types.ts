import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
import type { PAYMENT_METHODS } from "./payments.constants";

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Fila de `GET /payments` — `PaymentResource`. */
export interface PaymentRow {
  id: number;
  membership_id: number;
  member_id: number;

  // Montos (soles, no céntimos).
  amount: number;
  amount_paid: number;
  gateway_fee: number;
  balance_due: number;
  net_amount: number;

  gateway: string;
  status: string;

  // Solo si el gateway es Culqi.
  gateway_transaction_id?: string;
  gateway_status?: string;

  notes: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;

  /** Relaciones: solo vienen si el backend las cargó (`whenLoaded`). */
  member?: { full_name: string; dni: string };
  membership?: { plan_name: string };
}

export type PaymentListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type PaymentFilters = ListFilters<PaymentListParams>;

/**
 * Cuerpo de `POST /payments` (`StorePaymentRequest`). `payment_method`
 * describe el primer abono; los siguientes se crean con
 * `POST /payments/{id}/installments`. `gateway` no se envía: el backend lo
 * deduce solo a partir de `payment_method`.
 */
export interface CreatePaymentInput {
  membership_id: number;
  amount: number;
  amount_paid: number;
  payment_method: PaymentMethod;
  reference_code?: string | null;
  notes?: string | null;
  paid_at?: string | null;
}

/**
 * Cuerpo de `PATCH /payments/{id}` (`UpdatePaymentRequest`). Solo permite
 * corregir las notas generales del cobro; los abonos no se editan desde aquí.
 */
export interface UpdatePaymentInput {
  notes?: string | null;
}

/** Cuerpo de `POST /payments/{id}/installments` (`StoreInstallmentRequest`). */
export interface CreateInstallmentInput {
  amount: number;
  payment_method: PaymentMethod;
  reference_code?: string | null;
  notes?: string | null;
  paid_at?: string | null;
}
