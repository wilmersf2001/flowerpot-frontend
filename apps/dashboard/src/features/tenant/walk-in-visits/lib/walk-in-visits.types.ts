import type { BaseListParams } from "@/features/_shared/list-params";
import type { CashPaymentMethod } from "@/features/tenant/cash-register";
import type { LeadStatus } from "@/features/tenant/leads";
import type { VISIT_PAYMENT_METHODS, VISIT_TYPES } from "./walk-in-visits.constants";

export type VisitType = (typeof VISIT_TYPES)[number];
export type VisitPaymentMethod = (typeof VISIT_PAYMENT_METHODS)[number];

/** Visita pagada sin membresía — `WalkInVisitResource`. */
export interface WalkInVisitRow {
  id: number;
  type: VisitType;
  visited_on: string;
  branch_id: number;
  branch?: { id: number; name: string } | null;
  is_anonymous: boolean;
  lead_id: number | null;
  member_id: number | null;
  lead?: {
    id: number;
    name: string;
    phone: string;
    status: LeadStatus;
    contact_consent: boolean | null;
  } | null;
  member?: { id: number; full_name?: string; name?: string } | null;
  class_session_id: number | null;
  class_enrollment_id: number | null;
  amount: string;
  payment_method: CashPaymentMethod;
  payment_reference: string | null;
  cash_movement_id: number | null;
  refunded_at: string | null;
  recorded_by?: { id: number; name: string } | null;
  created_at: string;
}

export interface WalkInVisitListParams extends BaseListParams {
  type?: VisitType | "";
  branch_id?: string | null;
  lead_id?: string;
  member_id?: string;
  anonymous?: "true" | "false" | "";
  visited_on_start?: string;
  visited_on_end?: string;
  include_refunded?: "true" | "";
}

/* ------------------------------ Cobro ------------------------------ */

export interface VisitorInput {
  name: string;
  phone: string;
  contact_consent: boolean;
  dni?: string;
  birth_date?: string;
}

/** Cuerpo de `POST /branches/{id}/day-pass`: una sola forma de identificar a la persona. */
export interface DayPassInput {
  payment_method: VisitPaymentMethod;
  payment_reference?: string;
  visitor?: VisitorInput;
  lead_id?: number;
  member_id?: number;
  anonymous?: boolean;
  anonymous_reason?: string;
  new_person?: boolean;
  confirm_repeat?: boolean;
}

/** Candidatos de un `409 possible_match`. */
export type MatchCandidate =
  | { type: "lead"; id: number; name: string; status: LeadStatus }
  | { type: "member"; id: number; name: string; has_active_membership: boolean };

/* ------------------------------ Reporte ------------------------------ */

export interface VisitorsReportParams extends BaseListParams {
  date_from?: string;
  date_to?: string;
  branch_id?: string | null;
  type?: VisitType | "";
  min_visits?: string;
  only_consented?: "true" | "";
  exclude_converted?: "true" | "";
}

export interface VisitorsReportPerson {
  person_type: "lead" | "member";
  person: {
    id: number;
    name: string;
    phone: string | null;
    dni: string | null;
    status: string;
    contact_consent: boolean | null;
    member_id: number | null;
  };
  visits_count: number;
  total_paid: string;
  first_visit: string;
  last_visit: string;
}

export interface VisitorsReport {
  period: { from: string; to: string };
  summary: {
    total_visits: number;
    total_amount: string;
    day_pass_visits: number;
    class_visits: number;
    anonymous_visits: number;
    anonymous_amount: string;
    unique_people: number;
  };
  people: {
    data: VisitorsReportPerson[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
  };
}
