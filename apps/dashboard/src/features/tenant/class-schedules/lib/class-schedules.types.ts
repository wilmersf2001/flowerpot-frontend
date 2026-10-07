import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface ClassScheduleGymClass {
  id: number;
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
  id: number;
  staff?: ClassScheduleInstructorStaff;
}

export interface ClassScheduleBranch {
  id: number;
  name: string;
}

export interface ClassScheduleRow {
  id: number;
  gym_class_id: number;
  /** Relaciones: solo vienen si el backend las cargó (`whenLoaded`). */
  gym_class?: ClassScheduleGymClass;
  instructor_id: number;
  instructor?: ClassScheduleInstructor;
  branch_id: number;
  branch?: ClassScheduleBranch;
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
  effective_capacity?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClassScheduleListParams extends BaseListParams {
  branch_id?: string;
  instructor_id?: string;
  gym_class_id?: string;
  day_of_week?: number;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type ClassScheduleFilters = ListFilters<ClassScheduleListParams>;

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
