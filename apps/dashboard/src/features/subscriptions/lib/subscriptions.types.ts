import { SUBSCRIPTION_STATUSES } from "./subscriptions.constants";

/** Estado de una suscripción (`active` | `trial` | `cancelled` | `expired`). */
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/**
 * Cuerpo de `POST /subscriptions` (`StoreSubscriptionRequest`). El backend
 * guarda datos históricos del plan, por eso `plan_id` es el id numérico del
 * plan y `tenant_id` el identificador del gimnasio.
 */
export interface CreateSubscriptionInput {
  tenant_id: string;
  plan_id: number;
  starts_at: string;
  ends_at: string;
  status?: SubscriptionStatus;
  notes?: string;
}

/**
 * Cuerpo de `PUT /subscriptions/{subscription}` (`UpdateSubscriptionRequest`).
 * El backend NO deja cambiar `tenant_id`. Todos los campos son opcionales.
 */
export interface UpdateSubscriptionInput {
  plan_id?: number;
  starts_at?: string;
  ends_at?: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export interface SubscriptionListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Fila de `GET /subscriptions` — `SubscriptionResource`. */
export interface SubscriptionRow {
  id: string;
  tenant_id: string;
  /** Plan contratado (datos históricos). */
  plan_id: string;
  plan_name: string;
  plan_price_cents: string;
  plan_price_formatted: string;
  /** Vigencia. */
  starts_at: string;
  ends_at: string;
  days_remaining: string;
  status: string;
  notes: string;
  created_at: string;
}
