// TODO(gen): `api.d.ts` todavía no tiene `ProductCategoryResource`. Se escribe
// a mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface ProductCategoryRow {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductCategoryListParams extends BaseListParams {
  isActive?: boolean;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type ProductCategoryFilters = ListFilters<ProductCategoryListParams>;

/** Cuerpo de `POST /product-categories` (`StoreProductCategoryRequest`). */
export interface CreateProductCategoryInput {
  name: string;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /product-categories/{id}` (`UpdateProductCategoryRequest`). */
export interface UpdateProductCategoryInput {
  name?: string;
  is_active?: boolean;
}
