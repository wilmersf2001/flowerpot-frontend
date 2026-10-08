import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface JobPositionRow {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  /** Solo viene si el backend lo cargó (`withCount`). */
  staff_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type JobPositionListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type JobPositionFilters = ListFilters<JobPositionListParams>;

/** Cuerpo de `POST /job-positions` (`StoreJobPositionRequest`). */
export interface CreateJobPositionInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /job-positions/{jobPosition}` (`UpdateJobPositionRequest`). */
export interface UpdateJobPositionInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}
