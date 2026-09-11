// TODO(gen): `api.d.ts` no confirma el shape real de `GET /branches` (el
// schema `App.Http.Resources.Tenant.BranchResource` tipa `is_active` como
// `string`). Se normaliza a `boolean` en `branches.api.ts` al mapear la fila.

export interface BranchRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BranchListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Cuerpo de `POST /branches` (`StoreBranchRequest`). */
export interface CreateBranchInput {
  name: string;
  address?: string | null;
  phone?: string | null;
  timezone?: string | null;
}

/** Cuerpo de `PATCH /branches/{branch}` (`UpdateBranchRequest`). */
export interface UpdateBranchInput {
  name?: string;
  address?: string | null;
  phone?: string | null;
  timezone?: string | null;
}
