// TODO(gen): `api.d.ts` todavía no tiene `ProductResource`. Se escribe a mano
// y se reemplaza al correr `npm run gen -w packages/types`.

export interface ProductCategoryRef {
  id: string;
  name: string;
  is_active: boolean;
}

/** Cantidad disponible de un producto en una sede. Solo lectura desde esta API. */
export interface ProductStock {
  branch_id: string;
  branch_name: string;
  quantity: number;
}

export interface ProductRow {
  id: string;
  product_category_id: string | null;
  /** Solo viene cargada en `index`/`show`/`update`; en `store` es `null`. */
  category: ProductCategoryRef | null;
  name: string;
  description: string;
  sku: string;
  sale_price: number;
  /** Costo de referencia; lo pisa la última orden de compra recibida. */
  cost: number;
  is_active: boolean;
  /** Stock por sede. Solo viene cargado en `index`/`show`/`update`; en `store` es `[]`. */
  stocks: ProductStock[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductListParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

/** Cuerpo de `POST /products` (`StoreProductRequest`). */
export interface CreateProductInput {
  product_category_id?: number | null;
  name: string;
  description?: string | null;
  sku: string;
  sale_price: number;
  cost?: number;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /products/{id}` (`UpdateProductRequest`). */
export interface UpdateProductInput {
  product_category_id?: number | null;
  name?: string;
  description?: string | null;
  sku?: string;
  sale_price?: number;
  cost?: number;
  is_active?: boolean;
}
