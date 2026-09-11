import {
  MEMBERSHIP_CREATE_STATUSES,
  MEMBERSHIP_STATUSES,
} from "./memberships.constants";

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
export type MembershipCreateStatus = (typeof MEMBERSHIP_CREATE_STATUSES)[number];

/**
 * Cuerpo de `POST /memberships` (`StoreMembershipRequest`). El backend calcula
 * `ends_at` a partir de `starts_at` + la duración del plan; no se envía.
 */
export interface CreateMembershipInput {
  member_id: number;
  membership_plan_id: number;
  starts_at: string;
  status?: MembershipCreateStatus;
  notes?: string | null;
}

/**
 * Cuerpo de `PATCH /memberships/{id}` (`UpdateMembershipRequest`). El backend
 * no deja cambiar socio, plan ni vigencia una vez creada la membresía.
 */
export interface UpdateMembershipInput {
  status?: MembershipStatus;
  notes?: string | null;
}

export interface MembershipListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Fila de `GET /memberships` — `MembershipResource`. */
export interface MembershipRow {
  id: string;
  member_id: string;
  membership_plan_id: string;
  /** Datos históricos del plan. */
  plan_name: string;
  plan_price_cents: number;
  plan_price_formatted: string;
  plan_duration_days: number;
  /** Vigencia. */
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  is_expired: boolean;
  status: string;
  notes: string;
  created_at: string;
  /** Solo si el backend cargó la relación (`whenLoaded`). */
  member_name?: string;
}
