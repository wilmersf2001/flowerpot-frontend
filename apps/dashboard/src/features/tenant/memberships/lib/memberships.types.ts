import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
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

/** Sin filtros extra por ahora: declara aquí los que soporte `GET /memberships`. */
export type MembershipListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type MembershipFilters = ListFilters<MembershipListParams>;

/** Fila de `GET /memberships` — `MembershipResource`, tal cual la manda la API. */
export interface MembershipRow {
  id: number;
  member_id: number;
  member_name?: string;
  plan_name: string;
  plan_price_formatted: string;
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  is_expired: boolean;
  status: string;
  /** Aún no los expone `MembershipResource`; el formulario de edición los lee. */
  membership_plan_id?: number;
  notes?: string | null;
  /** Modo de acceso a sedes del plan; solo `limited` permite cambiar de sede. */
  branch_access?: "all" | "specific" | "limited";
  /** Tope de sedes elegibles (planes `limited`). */
  max_branches?: number | null;
  /** Sedes elegidas por el cliente. */
  branches?: { id: number; name: string }[];
}

/** Cuerpo de `PUT /memberships/{id}/branches` (`UpdateMembershipBranchesRequest`). */
export interface UpdateMembershipBranchesInput {
  /** Reemplaza las sedes elegidas: de 1 a `max_branches`, sin repetir. */
  branches: number[];
}
