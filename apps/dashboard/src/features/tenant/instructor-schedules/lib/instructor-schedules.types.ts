// TODO(gen): `api.d.ts` todavía no tiene `InstructorScheduleResource`. Se
// escribe a mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface InstructorScheduleBranch {
  id: number;
  name: string;
}

export interface InstructorScheduleRow {
  id: number;
  instructor_id: number;
  branch_id: number;
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

export interface InstructorScheduleListParams extends BaseListParams {
  instructorId: string;
  branchId?: string;
  dayOfWeek?: number;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type InstructorScheduleFilters = ListFilters<InstructorScheduleListParams>;

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
