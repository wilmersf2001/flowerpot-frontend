// TODO(gen): `api.d.ts` todavía no tiene `SupplierResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

/**
 * Los proveedores eliminados (soft delete) no aparecen en listados ni se
 * pueden consultar por id (404), así que el recurso no expone `deleted_at`:
 * no hay forma de mostrarlos ni de restaurarlos desde la pantalla.
 */
export interface SupplierRow {
  id: string;
  name: string;
  ruc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

/** Cuerpo de `POST /suppliers` (`StoreSupplierRequest`). */
export interface CreateSupplierInput {
  name: string;
  ruc?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

/** Cuerpo de `PATCH /suppliers/{id}` (`UpdateSupplierRequest`). */
export interface UpdateSupplierInput {
  name?: string;
  ruc?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}
