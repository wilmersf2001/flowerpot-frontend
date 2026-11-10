import { z } from "zod";
import { enumFallback, optionalText, requiredText } from "@/features/_shared/form-schema";
import { localDateOffset, toDateInputValue } from "@/features/_shared/format";
import {
  MEMBERSHIP_CANCELLATION_REASONS,
  MEMBERSHIP_CREATE_STATUSES,
  MEMBERSHIP_START_MAX_DAYS_IN_FUTURE,
  MEMBERSHIP_START_MAX_DAYS_IN_PAST,
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
export const membershipFormSchema = z
  .object({
    member_id: requiredText("El socio"),
    membership_plan_id: requiredText("El plan"),
    starts_at: requiredText("La fecha de inicio", "f"),
    status: z.enum(MEMBERSHIP_STATUSES),
    notes: optionalText(500),
    /** Estado con el que se abrió la edición (no se envía): el motivo solo se exige al cancelar. */
    initial_status: z.string(),
    /** Solo se pide (y se envía) al cancelar. */
    cancellation_reason: z.enum(["", ...MEMBERSHIP_CANCELLATION_REASONS]),
    /** Sedes elegidas; solo aplica si el plan es `limited`. */
    branches: z.array(z.string()),
    /**
     * Datos del plan elegido (los llena el combobox al seleccionarlo). No se
     * envían a la API: solo sirven para validar `branches`.
     */
    plan_branch_access: z.string(),
    plan_max_branches: z.string(),
  })
  .superRefine((form, ctx) => {
    if (
      form.status === "cancelled" &&
      form.initial_status !== "cancelled" &&
      !form.cancellation_reason
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cancellation_reason"],
        message: "Indica por qué se cancela la membresía.",
      });
    }
    if (form.plan_branch_access === "limited") {
      const max = Number(form.plan_max_branches) || 1;
      if (form.branches.length < 1 || form.branches.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["branches"],
          message: `Elige entre 1 y ${max} sede${max === 1 ? "" : "s"} para este plan.`,
        });
      }
    }
  });

/**
 * Validación extra del alta: la fecha de inicio no se edita, así que la
 * ventana de fechas solo se revisa al crear.
 */
export const createMembershipFormSchema = membershipFormSchema.superRefine((form, ctx) => {
  const { from, to } = membershipStartBounds();
  if (form.starts_at && (form.starts_at < from || form.starts_at > to)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["starts_at"],
      message: `Debe estar entre hace ${MEMBERSHIP_START_MAX_DAYS_IN_PAST} días y dentro de ${MEMBERSHIP_START_MAX_DAYS_IN_FUTURE} días.`,
    });
  }
});

/** Rango permitido para la fecha de inicio, en `YYYY-MM-DD`. */
export function membershipStartBounds() {
  return {
    from: localDateOffset(-MEMBERSHIP_START_MAX_DAYS_IN_PAST),
    to: localDateOffset(MEMBERSHIP_START_MAX_DAYS_IN_FUTURE),
  };
}

export type MembershipForm = z.infer<typeof membershipFormSchema>;

export const membershipFormDefaults: MembershipForm = {
  member_id: "",
  membership_plan_id: "",
  starts_at: "",
  // Queda pendiente de pago: se activa sola cuando el pago queda completo.
  status: "pending",
  notes: "",
  initial_status: "",
  cancellation_reason: "",
  branches: [],
  plan_branch_access: "",
  plan_max_branches: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const MEMBERSHIP_FORM_FIELDS = [
  "member_id",
  "membership_plan_id",
  "starts_at",
  "status",
  "notes",
  "cancellation_reason",
  "branches",
] as const satisfies readonly (keyof MembershipForm)[];

const normalizeStatus = enumFallback(MEMBERSHIP_STATUSES, "active");
const normalizeCreateStatus = enumFallback(MEMBERSHIP_CREATE_STATUSES, "pending");

/** Prellena el formulario con los datos de una membresía (modo edición). */
export function membershipToForm(row: MembershipRow): MembershipForm {
  return {
    member_id: String(row.member_id),
    membership_plan_id: String(row.membership_plan_id ?? ""),
    starts_at: toDateInputValue(row.starts_at),
    status: normalizeStatus(row.status),
    notes: row.notes ?? "",
    initial_status: row.status,
    cancellation_reason: "",
    branches: [],
    plan_branch_access: "",
    plan_max_branches: "",
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
    ...(form.plan_branch_access === "limited"
      ? { branches: form.branches.map(Number) }
      : {}),
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
    ...(form.status === "cancelled" &&
    form.initial_status !== "cancelled" &&
    form.cancellation_reason
      ? { cancellation_reason: form.cancellation_reason }
      : {}),
  };
}
