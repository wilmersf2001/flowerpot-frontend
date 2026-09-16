import { z } from "zod";
import { requiredText } from "@/features/_shared/form-schema";
import type {
  CreateInstructorScheduleInput,
  InstructorScheduleRow,
  UpdateInstructorScheduleInput,
} from "./instructor-schedules.types";

export const instructorScheduleFormSchema = z
  .object({
    branch_id: requiredText("La sede"),
    day_of_week: requiredText("El día"),
    start_time: requiredText("La hora de inicio"),
    end_time: requiredText("La hora de fin"),
  })
  .refine((data) => !data.start_time || !data.end_time || data.end_time > data.start_time, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["end_time"],
  });

export type InstructorScheduleForm = z.infer<typeof instructorScheduleFormSchema>;

export const instructorScheduleFormDefaults: InstructorScheduleForm = {
  branch_id: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const INSTRUCTOR_SCHEDULE_FORM_FIELDS = [
  "branch_id",
  "day_of_week",
  "start_time",
  "end_time",
] as const satisfies readonly (keyof InstructorScheduleForm)[];

/** `HH:MM:SS` (API) -> `HH:MM` (input `type="time"`). */
function toTimeInputValue(value: string): string {
  return value.slice(0, 5);
}

/** Prellena el formulario con los datos de un horario existente (modo edición). */
export function instructorScheduleToForm(schedule: InstructorScheduleRow): InstructorScheduleForm {
  return {
    branch_id: schedule.branch_id,
    day_of_week: String(schedule.day_of_week),
    start_time: toTimeInputValue(schedule.start_time),
    end_time: toTimeInputValue(schedule.end_time),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /instructor-schedules`. */
export function toCreateInstructorScheduleInput(
  instructorId: string,
  form: InstructorScheduleForm,
): CreateInstructorScheduleInput {
  return {
    instructor_id: Number(instructorId),
    branch_id: Number(form.branch_id),
    day_of_week: Number(form.day_of_week),
    start_time: form.start_time,
    end_time: form.end_time,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /instructor-schedules/{id}`. */
export function toUpdateInstructorScheduleInput(
  form: InstructorScheduleForm,
): UpdateInstructorScheduleInput {
  return {
    branch_id: Number(form.branch_id),
    day_of_week: Number(form.day_of_week),
    start_time: form.start_time,
    end_time: form.end_time,
  };
}
