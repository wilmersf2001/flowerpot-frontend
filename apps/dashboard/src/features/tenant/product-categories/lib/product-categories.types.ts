// TODO(gen): `api.d.ts` todavía no tiene `ProductCategoryResource`. Se escribe
// a mano y se reemplaza al correr `npm run gen -w packages/types`.

export interface ProductCategoryRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductCategoryListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

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
