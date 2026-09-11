// TODO(gen): `api.d.ts` no confirma el shape real de `GET /job-positions` (el
// schema `JobPositionResource` tipa `is_active` como `string`). Se normaliza
// a `boolean` en `job-positions.api.ts` al mapear la fila.

export interface JobPositionRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  staff_count: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface JobPositionListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

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
