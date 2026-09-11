import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type { CreateJobPositionInput, JobPositionRow, UpdateJobPositionInput } from "./job-positions.types";

export const jobPositionFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  description: optionalText(500),
});

export type JobPositionForm = z.infer<typeof jobPositionFormSchema>;

export const jobPositionFormDefaults: JobPositionForm = {
  name: "",
  description: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const JOB_POSITION_FORM_FIELDS = [
  "name",
  "description",
] as const satisfies readonly (keyof JobPositionForm)[];

/** Prellena el formulario con los datos de un cargo existente (modo edición). */
export function jobPositionToForm(jobPosition: JobPositionRow): JobPositionForm {
  return {
    name: jobPosition.name,
    description: jobPosition.description,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /job-positions`. */
export function toCreateJobPositionInput(form: JobPositionForm): CreateJobPositionInput {
  return {
    name: form.name,
    description: form.description || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /job-positions/{jobPosition}`. */
export function toUpdateJobPositionInput(form: JobPositionForm): UpdateJobPositionInput {
  return {
    name: form.name,
    description: form.description || null,
  };
}
