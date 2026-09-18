import { z } from "zod";
import { optionalText, requiredText } from "@/features/_shared/form-schema";
import type {
  ClassScheduleRow,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
} from "./class-schedules.types";

export const classScheduleFormSchema = z
  .object({
    gym_class_id: requiredText("La clase"),
    instructor_id: requiredText("El instructor"),
    branch_id: requiredText("La sede"),
    day_of_week: requiredText("El día"),
    start_time: requiredText("La hora de inicio"),
    end_time: requiredText("La hora de fin"),
    max_capacity: optionalText(10).refine(
      (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 1),
      "El cupo debe ser un número válido.",
    ),
  })
  .refine((data) => !data.start_time || !data.end_time || data.end_time > data.start_time, {
    message: "La hora de fin debe ser posterior a la hora de inicio.",
    path: ["end_time"],
  });

export type ClassScheduleForm = z.infer<typeof classScheduleFormSchema>;

export const classScheduleFormDefaults: ClassScheduleForm = {
  gym_class_id: "",
  instructor_id: "",
  branch_id: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
  max_capacity: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const CLASS_SCHEDULE_FORM_FIELDS = [
  "gym_class_id",
  "instructor_id",
  "branch_id",
  "day_of_week",
  "start_time",
  "end_time",
  "max_capacity",
] as const satisfies readonly (keyof ClassScheduleForm)[];

/** `HH:MM:SS` (API) -> `HH:MM` (input `type="time"`). */
function toTimeInputValue(value: string): string {
  return value.slice(0, 5);
}

/** Prellena el formulario con los datos de un horario existente (modo edición). */
export function classScheduleToForm(schedule: ClassScheduleRow): ClassScheduleForm {
  return {
    gym_class_id: schedule.gym_class_id,
    instructor_id: schedule.instructor_id,
    branch_id: schedule.branch_id,
    day_of_week: String(schedule.day_of_week),
    start_time: toTimeInputValue(schedule.start_time),
    end_time: toTimeInputValue(schedule.end_time),
    max_capacity: schedule.max_capacity == null ? "" : String(schedule.max_capacity),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /class-schedules`. */
export function toCreateClassScheduleInput(form: ClassScheduleForm): CreateClassScheduleInput {
  return {
    gym_class_id: Number(form.gym_class_id),
    instructor_id: Number(form.instructor_id),
    branch_id: Number(form.branch_id),
    day_of_week: Number(form.day_of_week),
    start_time: form.start_time,
    end_time: form.end_time,
    max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /class-schedules/{id}`. */
export function toUpdateClassScheduleInput(form: ClassScheduleForm): UpdateClassScheduleInput {
  return {
    gym_class_id: Number(form.gym_class_id),
    instructor_id: Number(form.instructor_id),
    branch_id: Number(form.branch_id),
    day_of_week: Number(form.day_of_week),
    start_time: form.start_time,
    end_time: form.end_time,
    max_capacity: form.max_capacity ? Number(form.max_capacity) : null,
  };
}
