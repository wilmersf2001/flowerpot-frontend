import { z } from "zod";
import {
  boundedText,
  enumFallback,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import {
  fromCents,
  toCents,
  toDateInputValue,
} from "@/features/_shared/format";
import { PROMOTION_DISCOUNT_TYPES } from "./promotions.constants";
import type { PromotionInput, PromotionRow } from "./promotions.types";

export const promotionFormSchema = z
  .object({
    code: boundedText("El código", { max: 50 }).regex(
      /^[A-Za-z0-9_-]+$/,
      "Solo letras, números, guion (-) y guion bajo (_).",
    ),
    name: boundedText("El nombre", { max: 120 }),
    description: optionalText(500),
    discount_type: z.enum(PROMOTION_DISCOUNT_TYPES),
    discount_value: numericText("El descuento", { min: 0.01, decimals: 2 }),
    valid_from: z.string().min(1, "La fecha de inicio es obligatoria."),
    valid_until: z.string(),
    /** Vacío = usos ilimitados. */
    max_uses: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 1),
        "Debe ser un entero mayor o igual a 1, o vacío.",
      ),
    is_active: z.boolean(),
    first_time_only: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.discount_type === "percentage" && Number(v.discount_value) > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_value"],
        message: "El porcentaje no puede ser mayor a 100.",
      });
    }
    if (v.valid_until && v.valid_until <= v.valid_from) {
      ctx.addIssue({
        code: "custom",
        path: ["valid_until"],
        message: "Debe ser posterior a la fecha de inicio.",
      });
    }
  });

export type PromotionForm = z.infer<typeof promotionFormSchema>;

export const promotionFormDefaults: PromotionForm = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  valid_from: "",
  valid_until: "",
  max_uses: "",
  is_active: true,
  first_time_only: false,
};

export const PROMOTION_FORM_FIELDS = [
  "code",
  "name",
  "description",
  "discount_type",
  "discount_value",
  "valid_from",
  "valid_until",
  "max_uses",
  "is_active",
  "first_time_only",
] as const satisfies readonly (keyof PromotionForm)[];

const normalizeType = enumFallback(PROMOTION_DISCOUNT_TYPES, "percentage");

export function promotionToForm(p: PromotionRow): PromotionForm {
  const type = normalizeType(p.discount_type);
  return {
    code: p.code,
    name: p.name,
    description: p.description ?? "",
    discount_type: type,
    discount_value:
      type === "fixed"
        ? String(fromCents(p.discount_value))
        : String(p.discount_value),
    valid_from: toDateInputValue(p.valid_from),
    valid_until: toDateInputValue(p.valid_until),
    max_uses: p.max_uses == null ? "" : String(p.max_uses),
    is_active: Boolean(p.is_active),
    first_time_only: Boolean(p.first_time_only),
  };
}

/** Cuerpo de `POST/PUT /promotions`: el monto fijo viaja en centavos. */
export function toPromotionInput(f: PromotionForm): PromotionInput {
  return {
    code: f.code.toUpperCase(),
    name: f.name,
    description: f.description,
    discount_type: f.discount_type,
    discount_value:
      f.discount_type === "fixed"
        ? toCents(f.discount_value)
        : Number(f.discount_value),
    valid_from: f.valid_from || null,
    valid_until: f.valid_until || null,
    max_uses: f.max_uses === "" ? null : Number(f.max_uses),
    is_active: f.is_active,
    first_time_only: f.first_time_only,
  };
}
