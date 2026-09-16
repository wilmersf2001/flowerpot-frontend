// TODO(gen): `api.d.ts` todavía no tiene `SpecialtyResource`. Se escribe a mano
// y se reemplaza al correr `npm run gen -w packages/types`.

export interface SpecialtyRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpecialtyListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/** Cuerpo de `POST /specialties` (`StoreSpecialtyRequest`). */
export interface CreateSpecialtyInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /specialties/{specialty}` (`UpdateSpecialtyRequest`). */
export interface UpdateSpecialtyInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}
