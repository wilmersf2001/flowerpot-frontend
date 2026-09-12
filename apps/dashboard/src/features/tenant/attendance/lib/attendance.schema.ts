import { z } from "zod";
import { optionalText, requiredText } from "@/features/_shared/form-schema";
import type { CreateAttendanceInput } from "./attendance.types";

/**
 * `branch_id` no es un campo del formulario: se registra en la sede activa
 * del switcher global (`useCreateAttendance` lo inyecta), no en una que elija
 * el usuario a mano.
 */
export const attendanceFormSchema = z.object({
  member_id: requiredText("El socio"),
  notes: optionalText(500),
});

export type AttendanceForm = z.infer<typeof attendanceFormSchema>;

export const attendanceFormDefaults: AttendanceForm = {
  member_id: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const ATTENDANCE_FORM_FIELDS = [
  "member_id",
  "notes",
] as const satisfies readonly (keyof AttendanceForm)[];

/** Convierte el formulario validado al cuerpo de `POST /attendances` (sin `branch_id`, lo añade `useCreateAttendance`). */
export function toCreateAttendanceInput(
  form: AttendanceForm,
): Omit<CreateAttendanceInput, "branch_id"> {
  return {
    member_id: Number(form.member_id),
    notes: form.notes || null,
  };
}
