import { z } from "zod";
import { PLAN_BILLING_PERIODS, PLAN_SLUG_PATTERN } from "./plans.constants";
import type {
  CreatePlanInput,
  PlanRow,
  UpdatePlanInput,
} from "./plans.types";

/** Campo numérico del formulario: llega como texto y validamos que sea >= 0. */
function numericField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
      `${label} debe ser un número válido.`,
    );
}

/**
 * Formulario de plan (alta y edición). Todos los campos viven como texto (lo
 * que entregan los `<input>`); los `to*Input` los normalizan al cuerpo real de
 * la API. En edición, `slug`/`currency`/`billing_period` se muestran pero no se
 * envían (el backend no los deja cambiar).
 */
export const planFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "El identificador es obligatorio.")
    .max(120, "Máximo 120 caracteres.")
    .regex(PLAN_SLUG_PATTERN, "Solo minúsculas, números y guion (-)."),
  description: z.string().trim().max(500, "Máximo 500 caracteres."),
  price: numericField("El precio"),
  currency: z
    .string()
    .trim()
    .length(3, "Usa el código ISO de 3 letras (p. ej. PEN).")
    .transform((value) => value.toUpperCase()),
  billing_period: z.enum(PLAN_BILLING_PERIODS),
  max_locations: numericField("El máximo de sedes"),
  max_members: numericField("El máximo de miembros"),
  sort_order: numericField("El orden"),
  /** Una característica por línea. */
  features: z.string(),
  is_active: z.boolean(),
});

export type PlanForm = z.infer<typeof planFormSchema>;

export const planFormDefaults: PlanForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  currency: "PEN",
  billing_period: "monthly",
  max_locations: "1",
  max_members: "0",
  sort_order: "0",
  features: "",
  is_active: true,
};

/** Texto multilínea de características -> lista sin vacíos ni espacios sobrantes. */
function splitFeatures(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeBillingPeriod(value: string): PlanForm["billing_period"] {
  return (PLAN_BILLING_PERIODS as readonly string[]).includes(value)
    ? (value as PlanForm["billing_period"])
    : "monthly";
}

/** Prellena el formulario con los datos de un plan existente (modo edición). */
export function planToForm(plan: PlanRow): PlanForm {
  return {
    name: plan.name,
    slug: plan.id,
    description: plan.description ?? "",
    price: (Number(plan.price_cents) / 100).toString(),
    currency: plan.currency,
    billing_period: normalizeBillingPeriod(plan.billing_period),
    max_locations: String(plan.max_locations),
    max_members: String(plan.max_members),
    sort_order: String(plan.sort_order),
    features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    is_active: Boolean(plan.is_active),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /plans`. */
export function toCreatePlanInput(form: PlanForm): CreatePlanInput {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    // El backend guarda el precio en centavos.
    price_cents: Math.round(Number(form.price) * 100),
    currency: form.currency,
    billing_period: form.billing_period,
    max_locations: Number(form.max_locations),
    max_members: Number(form.max_members),
    features: splitFeatures(form.features),
    sort_order: Number(form.sort_order),
  };
}

/**
 * Convierte el formulario validado al cuerpo de `PUT /plans/{plan}`. Omite los
 * campos que el backend no deja cambiar (`slug`, `currency`, `billing_period`).
 */
export function toUpdatePlanInput(form: PlanForm): UpdatePlanInput {
  return {
    name: form.name,
    description: form.description,
    price_cents: Math.round(Number(form.price) * 100),
    max_locations: Number(form.max_locations),
    max_members: Number(form.max_members),
    features: splitFeatures(form.features),
    sort_order: Number(form.sort_order),
    is_active: form.is_active,
  };
}
