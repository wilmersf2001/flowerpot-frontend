import { z } from "zod";
import {
  boundedText,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import type {
  CreateMembershipPlanInput,
  MembershipPlanRow,
  UpdateMembershipPlanInput,
} from "./membership-plans.types";

/**
 * Formulario de plan de membresía (alta y edición). Todos los campos viven
 * como texto (lo que entregan los `<input>`); los `to*Input` los normalizan
 * al cuerpo real de la API. En edición, `currency` se muestra pero no se
 * envía (el backend no la deja cambiar).
 */
export const membershipPlanFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  description: optionalText(500),
  price: numericText("El precio"),
  currency: z
    .string()
    .trim()
    .length(3, "Usa el código ISO de 3 letras (p. ej. PEN).")
    .transform((value) => value.toUpperCase()),
  duration_days: numericText("La duración", { min: 1 }),
  sort_order: numericText("El orden"),
  is_active: z.boolean(),
});

export type MembershipPlanForm = z.infer<typeof membershipPlanFormSchema>;

export const membershipPlanFormDefaults: MembershipPlanForm = {
  name: "",
  description: "",
  price: "",
  currency: "PEN",
  duration_days: "30",
  sort_order: "0",
  is_active: true,
};

/** Campos que el backend puede devolver como error de validación. */
export const MEMBERSHIP_PLAN_FORM_FIELDS = [
  "name",
  "description",
  "price",
  "currency",
  "duration_days",
  "sort_order",
  "is_active",
] as const satisfies readonly (keyof MembershipPlanForm)[];

/** Prellena el formulario con los datos de un plan existente (modo edición). */
export function membershipPlanToForm(
  plan: MembershipPlanRow,
): MembershipPlanForm {
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: (plan.price_cents / 100).toString(),
    currency: plan.currency,
    duration_days: String(plan.duration_days),
    sort_order: String(plan.sort_order),
    is_active: Boolean(plan.is_active),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /membership-plans`. */
export function toCreateMembershipPlanInput(
  form: MembershipPlanForm,
): CreateMembershipPlanInput {
  return {
    name: form.name,
    description: form.description,
    // El backend guarda el precio en centavos.
    price_cents: Math.round(Number(form.price) * 100),
    currency: form.currency,
    duration_days: Number(form.duration_days),
    sort_order: Number(form.sort_order),
  };
}

/**
 * Convierte el formulario validado al cuerpo de `PATCH /membership-plans/{id}`.
 * Omite `currency`, que el backend no deja cambiar.
 */
export function toUpdateMembershipPlanInput(
  form: MembershipPlanForm,
): UpdateMembershipPlanInput {
  return {
    name: form.name,
    description: form.description,
    price_cents: Math.round(Number(form.price) * 100),
    duration_days: Number(form.duration_days),
    sort_order: Number(form.sort_order),
    is_active: form.is_active,
  };
}
