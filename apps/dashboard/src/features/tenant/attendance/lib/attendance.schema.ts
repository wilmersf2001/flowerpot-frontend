import { z } from "zod";
import { optionalText, requiredText } from "@/features/_shared/form-schema";
import type { CreateAttendanceInput } from "./attendance.types";

export const attendanceFormSchema = z.object({
  member_id: requiredText("El socio"),
  branch_id: requiredText("La sede"),
  notes: optionalText(500),
});

export type AttendanceForm = z.infer<typeof attendanceFormSchema>;

export const attendanceFormDefaults: AttendanceForm = {
  member_id: "",
  branch_id: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const ATTENDANCE_FORM_FIELDS = [
  "member_id",
  "branch_id",
  "notes",
] as const satisfies readonly (keyof AttendanceForm)[];

/** Convierte el formulario validado al cuerpo de `POST /attendances`. */
export function toCreateAttendanceInput(form: AttendanceForm): CreateAttendanceInput {
  return {
    member_id: Number(form.member_id),
    branch_id: Number(form.branch_id),
    notes: form.notes || null,
  };
}
