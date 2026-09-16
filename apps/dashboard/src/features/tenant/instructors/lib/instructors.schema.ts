import { z } from "zod";
import { optionalText, requiredText } from "@/features/_shared/form-schema";
import type { CreateInstructorInput, InstructorRow, UpdateInstructorInput } from "./instructors.types";

export const instructorFormSchema = z.object({
  staff_id: requiredText("El personal"),
  bio: optionalText(2000),
  tarifa_por_clase: optionalText(20).refine(
    (value) =>
      value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 9999.99),
    "La tarifa debe ser un número válido.",
  ),
  fecha_inicio: z.string().trim(),
  specialty_ids: z.array(z.string()),
});

export type InstructorForm = z.infer<typeof instructorFormSchema>;

export const instructorFormDefaults: InstructorForm = {
  staff_id: "",
  bio: "",
  tarifa_por_clase: "",
  fecha_inicio: "",
  specialty_ids: [],
};

/** Campos que el backend puede devolver como error de validación. */
export const INSTRUCTOR_FORM_FIELDS = [
  "staff_id",
  "bio",
  "tarifa_por_clase",
  "fecha_inicio",
  "specialty_ids",
] as const satisfies readonly (keyof InstructorForm)[];

/** Prellena el formulario con los datos de un instructor existente (modo edición). */
export function instructorToForm(instructor: InstructorRow): InstructorForm {
  return {
    staff_id: instructor.staff_id,
    bio: instructor.bio,
    tarifa_por_clase: instructor.tarifa_por_clase,
    fecha_inicio: instructor.fecha_inicio ?? "",
    specialty_ids: instructor.specialties.map((specialty) => specialty.id),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /instructors`. */
export function toCreateInstructorInput(form: InstructorForm): CreateInstructorInput {
  return {
    staff_id: Number(form.staff_id),
    bio: form.bio || null,
    tarifa_por_clase: form.tarifa_por_clase ? Number(form.tarifa_por_clase) : null,
    fecha_inicio: form.fecha_inicio || null,
    specialty_ids: form.specialty_ids.map(Number),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /instructors/{instructor}`. */
export function toUpdateInstructorInput(form: InstructorForm): UpdateInstructorInput {
  return {
    bio: form.bio || null,
    tarifa_por_clase: form.tarifa_por_clase ? Number(form.tarifa_por_clase) : null,
    fecha_inicio: form.fecha_inicio || null,
    specialty_ids: form.specialty_ids.map(Number),
  };
}
