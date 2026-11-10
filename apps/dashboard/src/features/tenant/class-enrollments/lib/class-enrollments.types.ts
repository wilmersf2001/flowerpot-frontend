import type { BaseListParams } from "@/features/_shared/list-params";
import type { ENROLLMENT_PAYMENT_METHODS, ENROLLMENT_STATUSES } from "./class-enrollments.constants";

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];
export type EnrollmentPaymentMethod = (typeof ENROLLMENT_PAYMENT_METHODS)[number];
export type EnrollmentAccessType = "membership" | "drop_in";
export type EnrollmentAttendeeType = "member" | "lead";

/** Inscripción de una persona a una sesión — `ClassEnrollmentResource`. */
export interface ClassEnrollmentRow {
  id: number;
  class_session_id: number;
  member_id: number | null;
  lead_id: number | null;
  /** Quién ocupa el cupo. */
  attendee_type: EnrollmentAttendeeType;
  member: { id: number; full_name: string; dni: string | null; phone: string | null } | null;
  lead: { id: number; name: string; phone: string | null; dni: string | null } | null;
  membership_id: number | null;
  membership_plan: string | null;
  access_type: EnrollmentAccessType;
  /** Solo clase suelta, ej. `"15.00"`. */
  amount_paid: string | null;
  payment_method: EnrollmentPaymentMethod | null;
  payment_reference: string | null;
  /** Si se devolvió el pago de la clase suelta. */
  refunded_at: string | null;
  status: EnrollmentStatus;
  waitlisted_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClassEnrollmentListParams extends BaseListParams {
  status?: EnrollmentStatus | "";
  member_id?: string;
  lead_id?: string;
}

export interface EnrollVisitorInput {
  name: string;
  phone: string;
  contact_consent: boolean;
  dni?: string;
  birth_date?: string;
}

/** Cuerpo de `POST /class-sessions/{id}/enrollments`: una sola forma de identificar a la persona. */
export interface EnrollInput {
  member_id?: number;
  lead_id?: number;
  visitor?: EnrollVisitorInput;
  access_type?: EnrollmentAccessType;
  payment_method?: EnrollmentPaymentMethod;
  payment_reference?: string;
  new_person?: boolean;
  notes?: string;
}

/** Resultado de cancelar: la inscripción cancelada y las promovidas desde la lista de espera. */
export interface CancelEnrollmentResult {
  enrollment: ClassEnrollmentRow;
  promoted: ClassEnrollmentRow[];
}

/** Candidatos de un `409 possible_match`. */
export type EnrollMatchCandidate =
  | { type: "lead"; id: number; name: string; status?: string }
  | { type: "member"; id: number; name: string; has_active_membership?: boolean };
