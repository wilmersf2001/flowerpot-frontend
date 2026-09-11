import { z } from "zod";
import { enumFallback, optionalText, requiredText } from "@/features/_shared/form-schema";
import { toDateInputValue } from "@/features/_shared/format";
import {
  MEMBERSHIP_CREATE_STATUSES,
  MEMBERSHIP_STATUSES,
} from "./memberships.constants";
import type {
  CreateMembershipInput,
  MembershipRow,
  UpdateMembershipInput,
} from "./memberships.types";

/**
 * Formulario de membresía (alta y edición). Todos los campos viven como
 * texto; los `to*Input` los normalizan al cuerpo real de la API. En edición,
 * `member_id`/`membership_plan_id`/`starts_at` se muestran pero no se envían
 * (el backend no los deja cambiar una vez creada la membresía).
 */
export const membershipFormSchema = z.object({
  member_id: requiredText("El socio"),
  membership_plan_id: requiredText("El plan"),
  starts_at: requiredText("La fecha de inicio", "f"),
  status: z.enum(MEMBERSHIP_STATUSES),
  notes: optionalText(500),
});

export type MembershipForm = z.infer<typeof membershipFormSchema>;

export const membershipFormDefaults: MembershipForm = {
  member_id: "",
  membership_plan_id: "",
  starts_at: "",
  status: "active",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const MEMBERSHIP_FORM_FIELDS = [
  "member_id",
  "membership_plan_id",
  "starts_at",
  "status",
  "notes",
] as const satisfies readonly (keyof MembershipForm)[];

const normalizeStatus = enumFallback(MEMBERSHIP_STATUSES, "active");
const normalizeCreateStatus = enumFallback(MEMBERSHIP_CREATE_STATUSES, "active");

/** Prellena el formulario con los datos de una membresía (modo edición). */
export function membershipToForm(row: MembershipRow): MembershipForm {
  return {
    member_id: row.member_id,
    membership_plan_id: row.membership_plan_id,
    starts_at: toDateInputValue(row.starts_at),
    status: normalizeStatus(row.status),
    notes: row.notes ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /memberships`. */
export function toCreateMembershipInput(
  form: MembershipForm,
): CreateMembershipInput {
  return {
    member_id: Number(form.member_id),
    membership_plan_id: Number(form.membership_plan_id),
    starts_at: form.starts_at,
    status: normalizeCreateStatus(form.status),
    notes: form.notes || undefined,
  };
}

/**
 * Convierte el formulario validado al cuerpo de `PATCH /memberships/{id}`.
 * Omite `member_id`/`membership_plan_id`/`starts_at` (no se pueden cambiar).
 */
export function toUpdateMembershipInput(
  form: MembershipForm,
): UpdateMembershipInput {
  return {
    status: form.status,
    notes: form.notes || undefined,
  };
}
