import { z } from "zod";
import { enumFallback, requiredText } from "@/features/_shared/form-schema";
import { CLASS_SESSION_STATUSES } from "./class-sessions.constants";
import type { ClassSessionRow, UpdateClassSessionInput } from "./class-sessions.types";

/**
 * Formulario de sesión de clase (solo edición: cancelar o reasignar
 * instructor). Fecha, horario, clase y sede son de solo lectura — se
 * muestran en el diálogo pero no viven en este `schema`.
 */
export const classSessionFormSchema = z.object({
  instructor_id: requiredText("El instructor"),
  status: z.enum(CLASS_SESSION_STATUSES),
});

export type ClassSessionForm = z.infer<typeof classSessionFormSchema>;

export const classSessionFormDefaults: ClassSessionForm = {
  instructor_id: "",
  status: "scheduled",
};

/** Campos que el backend puede devolver como error de validación. */
export const CLASS_SESSION_FORM_FIELDS = [
  "instructor_id",
  "status",
] as const satisfies readonly (keyof ClassSessionForm)[];

const normalizeStatus = enumFallback(CLASS_SESSION_STATUSES, "scheduled");

/** Prellena el formulario con los datos de una sesión existente. */
export function classSessionToForm(session: ClassSessionRow): ClassSessionForm {
  return {
    instructor_id: session.instructor_id,
    status: normalizeStatus(session.status),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /class-sessions/{id}`. */
export function toUpdateClassSessionInput(form: ClassSessionForm): UpdateClassSessionInput {
  return {
    instructor_id: Number(form.instructor_id),
    status: form.status,
  };
}
