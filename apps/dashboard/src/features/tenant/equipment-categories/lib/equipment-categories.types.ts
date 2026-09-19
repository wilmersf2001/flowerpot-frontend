// TODO(gen): `api.d.ts` todavía no tiene `EquipmentCategoryResource`. Se
// escribe a mano y se reemplaza al correr `npm run gen -w packages/types`.

export interface EquipmentCategoryRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EquipmentCategoryListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

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
