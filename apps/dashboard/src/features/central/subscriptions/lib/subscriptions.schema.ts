import { z } from "zod";
import {
  enumFallback,
  optionalText,
  requiredText,
} from "@/features/_shared/form-schema";
import { toDateInputValue } from "@/features/_shared/format";
import { SUBSCRIPTION_STATUSES } from "./subscriptions.constants";
import type {
  CreateSubscriptionInput,
  SubscriptionRow,
  UpdateSubscriptionInput,
} from "./subscriptions.types";

/**
 * Formulario de suscripción (alta y edición). Todos los campos viven como
 * texto (lo que entregan los `<input>` / `<select>`); los `to*Input` los
 * normalizan al cuerpo real de la API. En edición, `tenant_id` se muestra
 * pero no se envía (el backend no lo deja cambiar).
 */
export const subscriptionFormSchema = z
  .object({
    tenant_id: requiredText("El gimnasio"),
    plan_id: requiredText("El plan"),
    starts_at: requiredText("La fecha de inicio", "f"),
    ends_at: requiredText("La fecha de fin", "f"),
    status: z.enum(SUBSCRIPTION_STATUSES),
    notes: optionalText(500),
  })
  .refine(
    (value) =>
      !value.starts_at || !value.ends_at || value.ends_at >= value.starts_at,
    {
      message: "La fecha de fin no puede ser anterior a la de inicio.",
      path: ["ends_at"],
    },
  );

export type SubscriptionForm = z.infer<typeof subscriptionFormSchema>;

export const subscriptionFormDefaults: SubscriptionForm = {
  tenant_id: "",
  plan_id: "",
  starts_at: "",
  ends_at: "",
  status: "active",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const SUBSCRIPTION_FORM_FIELDS = [
  "tenant_id",
  "plan_id",
  "starts_at",
  "ends_at",
  "status",
  "notes",
] as const satisfies readonly (keyof SubscriptionForm)[];

const normalizeStatus = enumFallback(SUBSCRIPTION_STATUSES, "active");

/** Prellena el formulario con los datos de una suscripción (modo edición). */
export function subscriptionToForm(row: SubscriptionRow): SubscriptionForm {
  return {
    tenant_id: row.tenant_id ?? "",
    plan_id: row.plan_id != null ? String(row.plan_id) : "",
    starts_at: toDateInputValue(row.starts_at),
    ends_at: toDateInputValue(row.ends_at),
    status: normalizeStatus(row.status),
    notes: row.notes ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /subscriptions`. */
export function toCreateSubscriptionInput(
  form: SubscriptionForm,
): CreateSubscriptionInput {
  return {
    tenant_id: form.tenant_id,
    plan_id: Number(form.plan_id),
    starts_at: form.starts_at,
    ends_at: form.ends_at,
    status: form.status,
    notes: form.notes || undefined,
  };
}

/**
 * Convierte el formulario validado al cuerpo de
 * `PUT /subscriptions/{subscription}`. Omite `tenant_id` (no se puede cambiar).
 */
export function toUpdateSubscriptionInput(
  form: SubscriptionForm,
): UpdateSubscriptionInput {
  return {
    plan_id: Number(form.plan_id),
    starts_at: form.starts_at,
    ends_at: form.ends_at,
    status: form.status,
    notes: form.notes || undefined,
  };
}
