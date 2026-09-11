import { z } from "zod";
import {
  boundedText,
  enumFallback,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import { splitLines } from "@/features/_shared/format";
import { PLAN_BILLING_PERIODS, PLAN_SLUG_PATTERN } from "./plans.constants";
import type { CreatePlanInput, PlanRow, UpdatePlanInput } from "./plans.types";

/**
 * Formulario de plan (alta y edición). Todos los campos viven como texto (lo
 * que entregan los `<input>`); los `to*Input` los normalizan al cuerpo real de
 * la API. En edición, `slug`/`currency`/`billing_period` se muestran pero no se
 * envían (el backend no los deja cambiar).
 */
export const planFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  slug: boundedText("El identificador", { max: 120 }).regex(
    PLAN_SLUG_PATTERN,
    "Solo minúsculas, números y guion (-).",
  ),
  description: optionalText(500),
  price: numericText("El precio"),
  currency: z
    .string()
    .trim()
    .length(3, "Usa el código ISO de 3 letras (p. ej. PEN).")
    .transform((value) => value.toUpperCase()),
  billing_period: z.enum(PLAN_BILLING_PERIODS),
  max_locations: numericText("El máximo de sedes"),
  max_members: numericText("El máximo de miembros"),
  sort_order: numericText("El orden"),
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

/** Campos que el backend puede devolver como error de validación. */
export const PLAN_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "price",
  "currency",
  "billing_period",
  "max_locations",
  "max_members",
  "sort_order",
  "features",
  "is_active",
] as const satisfies readonly (keyof PlanForm)[];

const normalizeBillingPeriod = enumFallback(PLAN_BILLING_PERIODS, "monthly");

/** Prellena el formulario con los datos de un plan existente (modo edición). */
export function planToForm(plan: PlanRow): PlanForm {
  return {
    name: plan.name,
    slug: plan.slug,
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
    features: splitLines(form.features),
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
    features: splitLines(form.features),
    sort_order: Number(form.sort_order),
    is_active: form.is_active,
  };
}
