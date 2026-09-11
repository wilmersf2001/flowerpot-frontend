// TODO(gen): `api.d.ts` no confirma el shape real de `GET /staff` (el schema
// `StaffResource` tipa `is_active` como `string` y `branches` como `string`,
// aunque el `toArray()` real serializa `branches` como un array de
// `{id, name}` vía `whenLoaded`). Se normaliza en `staff.api.ts` al mapear.

export interface StaffBranch {
  id: string;
  name: string;
}

export interface StaffRow {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  salary: string;
  hire_date: string | null;
  is_active: boolean;
  job_position_id: string | null;
  job_position_name: string | null;
  branches: StaffBranch[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StaffListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Cuerpo de `POST /staff` (`StoreStaffRequest`). */
export interface CreateStaffInput {
  job_position_id: number;
  first_name: string;
  last_name: string;
  dni: string;
  phone?: string | null;
  email?: string | null;
  salary?: number | null;
  hire_date: string;
  is_active?: boolean;
  branch_ids?: number[];
}

/** Cuerpo de `PATCH /staff/{staff}` (`UpdateStaffRequest`). */
export interface UpdateStaffInput {
  job_position_id?: number;
  first_name?: string;
  last_name?: string;
  dni?: string;
  phone?: string | null;
  email?: string | null;
  salary?: number | null;
  hire_date?: string;
  is_active?: boolean;
  branch_ids?: number[];
}
