// TODO(gen): `api.d.ts` todavía no tiene `SupplierResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

/**
 * Los proveedores eliminados (soft delete) no aparecen en listados ni se
 * pueden consultar por id (404), así que el recurso no expone `deleted_at`:
 * no hay forma de mostrarlos ni de restaurarlos desde la pantalla.
 */
export interface SupplierRow {
  id: number;
  name: string;
  ruc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierListParams extends BaseListParams {
  is_active?: boolean;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type SupplierFilters = ListFilters<SupplierListParams>;

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
