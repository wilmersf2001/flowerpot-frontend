import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
import type { MEMBER_GENDERS } from "./members.constants";

export type MemberGender = (typeof MEMBER_GENDERS)[number];

/** Fila de `GET /members` — `MemberResource`, tal cual la manda la API. */
export interface MemberRow {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  age: number | null;
  gender: MemberGender | null;
  photo_url: string | null;
  qr_code: string;
  is_active: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Membresía activa, si el backend la cargó (`whenLoaded`). */
  active_membership?: { status: string; plan_name: string } | null;
}

export interface MemberListParams extends BaseListParams {
  /** Sede activa (switcher global). `useMembers` la inyecta; no la pasa la página. */
  branch_id?: string | null;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type MemberFilters = ListFilters<MemberListParams>;

/** Cuerpo de `POST /members` (`StoreMemberRequest`). */
export interface CreateMemberInput {
  first_name: string;
  last_name: string;
  dni: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: MemberGender | null;
  photo_url?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  /** Sede activa al momento de crear el socio (`useCreateMember` la inyecta). */
  branch_id?: number | null;
}

/** Cuerpo de `PATCH /members/{id}` (`UpdateMemberRequest`). */
export interface UpdateMemberInput {
  first_name?: string;
  last_name?: string;
  dni?: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: MemberGender | null;
  photo_url?: string | null;
  is_active?: boolean;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
}
