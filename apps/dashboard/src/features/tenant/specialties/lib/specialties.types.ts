// TODO(gen): `api.d.ts` todavía no tiene `SpecialtyResource`. Se escribe a mano
// y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface SpecialtyRow {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type SpecialtyListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type SpecialtyFilters = ListFilters<SpecialtyListParams>;

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
