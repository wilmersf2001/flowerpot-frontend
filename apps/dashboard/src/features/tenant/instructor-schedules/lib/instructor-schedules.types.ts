// TODO(gen): `api.d.ts` todavía no tiene `InstructorScheduleResource`. Se
// escribe a mano y se reemplaza al correr `npm run gen -w packages/types`.

export interface InstructorScheduleBranch {
  id: string;
  name: string;
}

export interface InstructorScheduleRow {
  id: string;
  instructor_id: string;
  branch_id: string;
  branch: InstructorScheduleBranch | null;
  /** 1 = Lunes ... 7 = Domingo. */
  day_of_week: number;
  /** `HH:MM:SS`. */
  start_time: string;
  /** `HH:MM:SS`. */
  end_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface InstructorScheduleListParams {
  instructorId: string;
  branchId?: string;
  dayOfWeek?: number;
  page?: number;
  perPage?: number;
}

/** Cuerpo de `POST /instructor-schedules` (`StoreInstructorScheduleRequest`). */
export interface CreateInstructorScheduleInput {
  instructor_id: number;
  branch_id: number;
  day_of_week: number;
  /** `HH:MM`. */
  start_time: string;
  /** `HH:MM`. */
  end_time: string;
}

/** Cuerpo de `PATCH /instructor-schedules/{id}` (`UpdateInstructorScheduleRequest`). */
export interface UpdateInstructorScheduleInput {
  branch_id?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}
