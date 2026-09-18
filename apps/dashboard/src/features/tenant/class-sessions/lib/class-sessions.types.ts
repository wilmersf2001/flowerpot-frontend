// TODO(gen): `api.d.ts` todavía no tiene `ClassSessionResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import { CLASS_SESSION_STATUSES } from "./class-sessions.constants";

export type ClassSessionStatus = (typeof CLASS_SESSION_STATUSES)[number];

export interface ClassSessionGymClass {
  id: string;
  name: string;
}

export interface ClassSessionBranch {
  id: string;
  name: string;
}

/** `ClassScheduleResource` anidado (ver módulo de horarios), con `gym_class` anidada. */
export interface ClassSessionClassSchedule {
  id: string;
  gym_class: ClassSessionGymClass | null;
  branch: ClassSessionBranch | null;
}

/** Resumen del `staff` asociado al instructor (ver módulo de instructores). */
export interface ClassSessionInstructorStaff {
  full_name: string;
  dni: string;
}

export interface ClassSessionInstructor {
  id: string;
  staff: ClassSessionInstructorStaff | null;
}

/**
 * Fila de `GET /class-sessions`. `start_time`, `end_time`, `instructor_id` y
 * `max_capacity` son una copia congelada del horario al momento en que se
 * generó la sesión: no reflejan cambios posteriores en `class_schedules`.
 */
export interface ClassSessionRow {
  id: string;
  class_schedule_id: string;
  class_schedule: ClassSessionClassSchedule | null;
  /** `YYYY-MM-DD`. */
  session_date: string;
  /** `HH:MM:SS`. */
  start_time: string;
  /** `HH:MM:SS`. */
  end_time: string;
  instructor_id: string;
  instructor: ClassSessionInstructor | null;
  max_capacity: number;
  status: ClassSessionStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClassSessionListParams {
  page?: number;
  perPage?: number;
  classScheduleId?: string;
  instructorId?: string;
  status?: ClassSessionStatus;
  sessionDateStart?: string;
  sessionDateEnd?: string;
}

/**
 * Cuerpo de `PATCH /class-sessions/{id}` (`UpdateClassSessionRequest`). No
 * existen `store`, `destroy` ni `restore` para este recurso desde la API.
 */
export interface UpdateClassSessionInput {
  instructor_id?: number;
  status?: ClassSessionStatus;
}
