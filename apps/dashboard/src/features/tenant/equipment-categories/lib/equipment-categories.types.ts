// TODO(gen): `api.d.ts` todavía no tiene `EquipmentCategoryResource`. Se
// escribe a mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface EquipmentCategoryRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EquipmentCategoryListParams extends BaseListParams {
  isActive?: boolean;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type EquipmentCategoryFilters = ListFilters<EquipmentCategoryListParams>;

/** Cuerpo de `POST /equipment-categories` (`StoreEquipmentCategoryRequest`). */
export interface CreateEquipmentCategoryInput {
  name: string;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /equipment-categories/{id}` (`UpdateEquipmentCategoryRequest`). */
export interface UpdateEquipmentCategoryInput {
  name?: string;
  is_active?: boolean;
}
