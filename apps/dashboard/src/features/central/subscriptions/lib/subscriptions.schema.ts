import { z } from "zod";
import {
  enumFallback,
  optionalText,
  requiredText,
} from "@/features/_shared/form-schema";
import { SUBSCRIPTION_STATUSES } from "./subscriptions.constants";
import type {
  CreateSubscriptionInput,
  RenewSubscriptionInput,
  SubscriptionRow,
  UpdateSubscriptionInput,
} from "./subscriptions.types";

/**
 * Formulario de suscripción (alta y edición). Todos los campos viven como
 * texto (lo que entregan los `<input>` / `<select>`); los `to*Input` los
 * normalizan al cuerpo real de la API. En edición, `tenant_id` se muestra
 * pero no se envía (el backend no lo deja cambiar).
 */
export const subscriptionFormSchema = z.object({
  tenant_id: requiredText("El gimnasio"),
  plan_id: requiredText("El plan"),
  status: z.enum(SUBSCRIPTION_STATUSES),
  notes: optionalText(500),
});

export type SubscriptionForm = z.infer<typeof subscriptionFormSchema>;

export const subscriptionFormDefaults: SubscriptionForm = {
  tenant_id: "",
  plan_id: "",
  status: "active",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const SUBSCRIPTION_FORM_FIELDS = [
  "tenant_id",
  "plan_id",
  "status",
  "notes",
] as const satisfies readonly (keyof SubscriptionForm)[];

/**
 * Formulario de renovación (`POST /subscriptions/{id}/renew`). Ambos campos
 * son opcionales: sin `plan_id` el backend repite el plan actual.
 */
export const renewSubscriptionFormSchema = z.object({
  plan_id: optionalText(20),
  notes: optionalText(500),
});

export type RenewSubscriptionForm = z.infer<typeof renewSubscriptionFormSchema>;

export const renewSubscriptionFormDefaults: RenewSubscriptionForm = {
  plan_id: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const RENEW_SUBSCRIPTION_FORM_FIELDS = [
  "plan_id",
  "notes",
] as const satisfies readonly (keyof RenewSubscriptionForm)[];

/** Convierte el formulario de renovación al cuerpo de `POST .../renew`. */
export function toRenewSubscriptionInput(
  form: RenewSubscriptionForm,
): RenewSubscriptionInput {
  return {
    plan_id: form.plan_id ? Number(form.plan_id) : undefined,
    notes: form.notes || undefined,
  };
}

const normalizeStatus = enumFallback(SUBSCRIPTION_STATUSES, "active");

/** Prellena el formulario con los datos de una suscripción (modo edición). */
export function subscriptionToForm(row: SubscriptionRow): SubscriptionForm {
  return {
    tenant_id: row.tenant_id ?? "",
    plan_id: row.plan_id != null ? String(row.plan_id) : "",
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
    status: form.status,
    notes: form.notes || undefined,
  };
}
