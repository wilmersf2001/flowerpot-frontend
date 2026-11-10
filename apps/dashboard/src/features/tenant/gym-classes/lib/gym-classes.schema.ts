import { z } from "zod";
import { boundedText, numericText, optionalText } from "@/features/_shared/form-schema";
import type { CreateGymClassInput, GymClassRow, UpdateGymClassInput } from "./gym-classes.types";

export const gymClassFormSchema = z.object({
  specialty_id: z.string(),
  name: boundedText("El nombre", { max: 255 }),
  description: optionalText(2000),
  duration_minutes: numericText("La duración", { min: 1 }),
  max_capacity: numericText("El cupo", { min: 1 }),
  /** Vacío = la clase no admite clase suelta. */
  drop_in_price: z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;
      const n = Number(value);
      return Number.isFinite(n) && n > 0 && /^\d+(\.\d{1,2})?$/.test(value);
    }, "El precio debe ser mayor a 0 (máximo 2 decimales)."),
});

export type GymClassForm = z.infer<typeof gymClassFormSchema>;

export const gymClassFormDefaults: GymClassForm = {
  specialty_id: "",
  name: "",
  description: "",
  duration_minutes: "60",
  max_capacity: "20",
  drop_in_price: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const GYM_CLASS_FORM_FIELDS = [
  "specialty_id",
  "name",
  "description",
  "duration_minutes",
  "max_capacity",
  "drop_in_price",
] as const satisfies readonly (keyof GymClassForm)[];

/** Prellena el formulario con los datos de una clase existente (modo edición). */
export function gymClassToForm(gymClass: GymClassRow): GymClassForm {
  return {
    specialty_id: gymClass.specialty_id == null ? "" : String(gymClass.specialty_id),
    name: gymClass.name,
    description: gymClass.description ?? "",
    duration_minutes: String(gymClass.duration_minutes),
    max_capacity: String(gymClass.max_capacity),
    drop_in_price: gymClass.drop_in_price == null ? "" : String(Number(gymClass.drop_in_price)),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /gym-classes`. */
export function toCreateGymClassInput(form: GymClassForm): CreateGymClassInput {
  return {
    specialty_id: form.specialty_id ? Number(form.specialty_id) : null,
    name: form.name,
    description: form.description || null,
    duration_minutes: Number(form.duration_minutes),
    max_capacity: Number(form.max_capacity),
    drop_in_price: form.drop_in_price ? Number(form.drop_in_price) : null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /gym-classes/{id}`. */
export function toUpdateGymClassInput(form: GymClassForm): UpdateGymClassInput {
  return {
    specialty_id: form.specialty_id ? Number(form.specialty_id) : null,
    name: form.name,
    description: form.description || null,
    duration_minutes: Number(form.duration_minutes),
    max_capacity: Number(form.max_capacity),
    drop_in_price: form.drop_in_price ? Number(form.drop_in_price) : null,
  };
}
