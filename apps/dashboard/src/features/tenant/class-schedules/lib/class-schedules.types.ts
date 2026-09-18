// TODO(gen): `api.d.ts` todavía no tiene `ClassScheduleResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

export interface ClassScheduleGymClass {
  id: string;
  name: string;
  duration_minutes: number;
  max_capacity: number;
}

/** Resumen del `staff` asociado al instructor (ver módulo de instructores). */
export interface ClassScheduleInstructorStaff {
  full_name: string;
  dni: string;
}

export interface ClassScheduleInstructor {
  id: string;
  staff: ClassScheduleInstructorStaff | null;
}

export interface ClassScheduleBranch {
  id: string;
  name: string;
}

export interface ClassScheduleRow {
  id: string;
  gym_class_id: string;
  /** Solo viene cargada en el `index`; en `store`/`update`/`show` es `null`. */
  gym_class: ClassScheduleGymClass | null;
  instructor_id: string;
  instructor: ClassScheduleInstructor | null;
  branch_id: string;
  branch: ClassScheduleBranch | null;
  /** 1 = Lunes ... 7 = Domingo. */
  day_of_week: number;
  /** Nombre del día en español, calculado en backend. */
  day_label: string;
  /** `HH:MM:SS`. */
  start_time: string;
  /** `HH:MM:SS`. */
  end_time: string;
  /** Override del cupo de la clase. `null` = hereda el de `gym_class`. */
  max_capacity: number | null;
  /** Solo viene calculado en el `index` (`max_capacity` ?? el de `gym_class`). */
  effective_capacity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClassScheduleListParams {
  page?: number;
  perPage?: number;
  branchId?: string;
  instructorId?: string;
  gymClassId?: string;
  dayOfWeek?: number;
}

/** Cuerpo de `POST /class-schedules` (`StoreClassScheduleRequest`). */
export interface CreateClassScheduleInput {
  gym_class_id: number;
  instructor_id: number;
  branch_id: number;
  day_of_week: number;
  /** `HH:MM`. */
  start_time: string;
  /** `HH:MM`. */
  end_time: string;
  max_capacity?: number | null;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /class-schedules/{id}` (`UpdateClassScheduleRequest`). */
export interface UpdateClassScheduleInput {
  gym_class_id?: number;
  instructor_id?: number;
  branch_id?: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  max_capacity?: number | null;
  is_active?: boolean;
}
