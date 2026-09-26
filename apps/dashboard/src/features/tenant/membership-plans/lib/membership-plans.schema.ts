import { z } from "zod";
import {
  boundedText,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import { fromCents, toCents } from "@/features/_shared/format";
import { BRANCH_ACCESS_MODES } from "./membership-plans.constants";
import type {
  CreateMembershipPlanInput,
  MembershipPlanRow,
  MembershipPlanServiceInput,
  UpdateMembershipPlanInput,
} from "./membership-plans.types";

/**
 * Formulario de plan de membresía (alta y edición). Todos los campos viven
 * como texto (lo que entregan los `<input>`); los `to*Input` los normalizan
 * al cuerpo real de la API. En edición, `currency` se muestra pero no se
 * envía (el backend no la deja cambiar).
 */
export const membershipPlanFormSchema = z
  .object({
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
  /** Ids de sedes (texto, como los entrega el combobox). Mínimo una. */
  branch_ids: z.array(z.string()),
  branch_access: z.enum(BRANCH_ACCESS_MODES),
  /** Solo con `limited`. */
  max_branches: z.string().trim(),
  /** Servicios incluidos; `quota` vacío = ilimitado. */
  services: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quota: z
        .string()
        .trim()
        .refine(
          (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0),
          "El cupo debe ser un entero mayor o igual a 0.",
        ),
    }),
  ),
  })
  .superRefine((form, ctx) => {
    if (form.branch_access === "specific" && form.branch_ids.length === 0) {
      ctx.addIssue({ code: "custom", path: ["branch_ids"], message: "Selecciona al menos una sede." });
    }
    if (
      form.branch_access === "limited" &&
      !(Number.isInteger(Number(form.max_branches)) && Number(form.max_branches) >= 1)
    ) {
      ctx.addIssue({ code: "custom", path: ["max_branches"], message: "Indica cuántas sedes puede elegir el cliente (mínimo 1)." });
    }
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
  branch_ids: [],
  branch_access: "all",
  max_branches: "",
  services: [],
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
  "branch_ids",
  "branch_access",
  "max_branches",
  "services",
] as const satisfies readonly (keyof MembershipPlanForm)[];

/** Prellena el formulario con los datos de un plan existente (modo edición). */
export function membershipPlanToForm(
  plan: MembershipPlanRow,
): MembershipPlanForm {
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: fromCents(plan.price_cents).toString(),
    currency: plan.currency,
    duration_days: String(plan.duration_days),
    sort_order: String(plan.sort_order),
    is_active: Boolean(plan.is_active),
    branch_access: plan.branch_access ?? "specific",
    max_branches: plan.max_branches ? String(plan.max_branches) : "",
    branch_ids: (plan.branches ?? []).map((branch) => String(branch.id)),
    services: (plan.services ?? []).map((service) => ({
      id: String(service.id),
      name: service.name,
      quota: service.quota === null ? "" : String(service.quota),
    })),
  };
}

/** Acceso a sedes -> campos del backend: solo manda lo que aplica al modo elegido. */
function toBranchAccessInput(form: MembershipPlanForm) {
  return {
    branch_access: form.branch_access,
    ...(form.branch_access === "limited" ? { max_branches: Number(form.max_branches) } : {}),
    ...(form.branch_access === "specific" ? { branches: form.branch_ids.map(Number) } : {}),
  };
}

/** Servicios del formulario -> `services[]` del backend (`quota` vacío => `null`). */
function toServicesInput(form: MembershipPlanForm): MembershipPlanServiceInput[] {
  return form.services.map((service) => ({
    id: Number(service.id),
    quota: service.quota === "" ? null : Number(service.quota),
  }));
}

/** Convierte el formulario validado al cuerpo de `POST /membership-plans`. */
export function toCreateMembershipPlanInput(
  form: MembershipPlanForm,
): CreateMembershipPlanInput {
  return {
    name: form.name,
    description: form.description,
    // El backend guarda el precio en centavos.
    price_cents: toCents(form.price),
    currency: form.currency,
    duration_days: Number(form.duration_days),
    sort_order: Number(form.sort_order),
    ...toBranchAccessInput(form),
    services: toServicesInput(form),
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
    price_cents: toCents(form.price),
    duration_days: Number(form.duration_days),
    sort_order: Number(form.sort_order),
    is_active: form.is_active,
    ...toBranchAccessInput(form),
    services: toServicesInput(form),
  };
}
