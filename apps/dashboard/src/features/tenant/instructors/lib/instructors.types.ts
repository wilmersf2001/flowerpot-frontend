// TODO(gen): `api.d.ts` todavía no tiene `InstructorResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface InstructorStaffBranch {
  id: number;
  name: string;
}

/** Resumen del `staff` 1:1 asociado (`StaffResource`, ver módulo de personal). */
export interface InstructorStaff {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  is_active: boolean;
  job_position?: { name: string };
  branches: InstructorStaffBranch[];
}

export interface InstructorSpecialty {
  id: number;
  name: string;
}

export interface InstructorRow {
  id: number;
  staff_id: number;
  staff: InstructorStaff | null;
  bio: string;
  /** Decimal como texto (p. ej. "50.00"), igual que `salary` en `StaffRow`. */
  tarifa_por_clase: string;
  fecha_inicio: string | null;
  is_active: boolean;
  specialties: InstructorSpecialty[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type InstructorListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type InstructorFilters = ListFilters<InstructorListParams>;

/** Cuerpo de `POST /instructors` (`StoreInstructorRequest`). */
export interface CreateInstructorInput {
  staff_id: number;
  bio?: string | null;
  tarifa_por_clase?: number | null;
  fecha_inicio?: string | null;
  is_active?: boolean;
  specialty_ids?: number[];
}

/**
 * Cuerpo de `PATCH /instructors/{instructor}` (`UpdateInstructorRequest`).
 * `staff_id` no se puede reasignar: la relación 1:1 se fija al crear.
 */
export interface UpdateInstructorInput {
  bio?: string | null;
  tarifa_por_clase?: number | null;
  fecha_inicio?: string | null;
  is_active?: boolean;
  specialty_ids?: number[];
}
