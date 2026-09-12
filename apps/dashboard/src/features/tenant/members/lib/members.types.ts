import type { MEMBER_GENDERS } from "./members.constants";

export type MemberGender = (typeof MEMBER_GENDERS)[number];

export interface MemberRow {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  dni: string;
  email: string;
  phone: string;
  birth_date: string | null;
  age: number | null;
  gender: MemberGender | null;
  photo_url: string;
  qr_code: string;
  is_active: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Membresía activa, si el backend la cargó (`whenLoaded`). */
  active_membership_status: string | null;
  active_membership_plan_name: string | null;
}

export interface MemberListParams {
  page?: number;
  perPage?: number;
  search?: string;
  /** Sede activa (switcher global). `useMembers` la inyecta; no la pasa la página. */
  branchId?: string | null;
}

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
