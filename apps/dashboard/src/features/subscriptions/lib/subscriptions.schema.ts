import { z } from "zod";
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
    tenant_id: z.string().trim().min(1, "El gimnasio es obligatorio."),
    plan_id: z.string().trim().min(1, "El plan es obligatorio."),
    starts_at: z.string().trim().min(1, "La fecha de inicio es obligatoria."),
    ends_at: z.string().trim().min(1, "La fecha de fin es obligatoria."),
    status: z.enum(SUBSCRIPTION_STATUSES),
    notes: z.string().trim().max(500, "Máximo 500 caracteres."),
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
] as const;

/** ISO / date-time -> `YYYY-MM-DD` para un `<input type="date">`. */
function toDateInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function normalizeStatus(value: string): SubscriptionForm["status"] {
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(value)
    ? (value as SubscriptionForm["status"])
    : "active";
}

/** Prellena el formulario con los datos de una suscripción (modo edición). */
export function subscriptionToForm(row: SubscriptionRow): SubscriptionForm {
  return {
    tenant_id: row.tenant_id ?? "",
    plan_id: row.plan_id != null ? String(row.plan_id) : "",
    starts_at: toDateInput(row.starts_at),
    ends_at: toDateInput(row.ends_at),
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
