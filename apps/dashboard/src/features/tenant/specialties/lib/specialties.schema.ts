import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type { CreateSpecialtyInput, SpecialtyRow, UpdateSpecialtyInput } from "./specialties.types";

export const specialtyFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  description: optionalText(500),
});

export type SpecialtyForm = z.infer<typeof specialtyFormSchema>;

export const specialtyFormDefaults: SpecialtyForm = {
  name: "",
  description: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const SPECIALTY_FORM_FIELDS = [
  "name",
  "description",
] as const satisfies readonly (keyof SpecialtyForm)[];

/** Prellena el formulario con los datos de una especialidad existente (modo edición). */
export function specialtyToForm(specialty: SpecialtyRow): SpecialtyForm {
  return {
    name: specialty.name,
    description: specialty.description,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /specialties`. */
export function toCreateSpecialtyInput(form: SpecialtyForm): CreateSpecialtyInput {
  return {
    name: form.name,
    description: form.description || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /specialties/{specialty}`. */
export function toUpdateSpecialtyInput(form: SpecialtyForm): UpdateSpecialtyInput {
  return {
    name: form.name,
    description: form.description || null,
  };
}
