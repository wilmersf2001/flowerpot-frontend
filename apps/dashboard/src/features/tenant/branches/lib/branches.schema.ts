import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type { BranchRow, CreateBranchInput, UpdateBranchInput } from "./branches.types";

export const branchFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  address: optionalText(255),
  phone: optionalText(30),
  timezone: optionalText(60),
  // Opcional: vacío = sin pase diario definido.
  day_pass_price: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
      "El precio debe ser un número mayor o igual a 0.",
    )
    .refine(
      (value) => (value.split(".")[1] ?? "").length <= 2,
      "El precio admite como máximo 2 decimales.",
    ),
});

export type BranchForm = z.infer<typeof branchFormSchema>;

export const branchFormDefaults: BranchForm = {
  name: "",
  address: "",
  phone: "",
  timezone: "",
  day_pass_price: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const BRANCH_FORM_FIELDS = [
  "name",
  "address",
  "phone",
  "timezone",
  "day_pass_price",
] as const satisfies readonly (keyof BranchForm)[];

/** Prellena el formulario con los datos de una sede existente (modo edición). */
export function branchToForm(branch: BranchRow): BranchForm {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    timezone: branch.timezone,
    day_pass_price: branch.day_pass_price == null ? "" : String(Number(branch.day_pass_price)),
  };
}

/** Texto del formulario -> monto o `null` si está vacío. */
function toDayPassPrice(value: string): number | null {
  return value === "" ? null : Number(value);
}

/** Convierte el formulario validado al cuerpo de `POST /branches`. */
export function toCreateBranchInput(form: BranchForm): CreateBranchInput {
  return {
    name: form.name,
    address: form.address || null,
    phone: form.phone || null,
    timezone: form.timezone || null,
    day_pass_price: toDayPassPrice(form.day_pass_price),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /branches/{branch}`. */
export function toUpdateBranchInput(form: BranchForm): UpdateBranchInput {
  return {
    name: form.name,
    address: form.address || null,
    phone: form.phone || null,
    timezone: form.timezone || null,
    day_pass_price: toDayPassPrice(form.day_pass_price),
  };
}
