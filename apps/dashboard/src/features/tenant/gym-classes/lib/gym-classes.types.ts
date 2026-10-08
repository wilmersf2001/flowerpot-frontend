import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface GymClassSpecialty {
  id: number;
  name: string;
}

export interface GymClassRow {
  id: number;
  specialty_id: number | null;
  /** Solo viene cargada en el `index` (`whenLoaded`). */
  specialty?: GymClassSpecialty | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  max_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type GymClassListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type GymClassFilters = ListFilters<GymClassListParams>;

/** Cuerpo de `POST /gym-classes` (`StoreGymClassRequest`). */
export interface CreateGymClassInput {
  specialty_id?: number | null;
  name: string;
  description?: string | null;
  duration_minutes: number;
  max_capacity: number;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /gym-classes/{id}` (`UpdateGymClassRequest`). */
export interface UpdateGymClassInput {
  specialty_id?: number | null;
  name?: string;
  description?: string | null;
  duration_minutes?: number;
  max_capacity?: number;
  is_active?: boolean;
}
