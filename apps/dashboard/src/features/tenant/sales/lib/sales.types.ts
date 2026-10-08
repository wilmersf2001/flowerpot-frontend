// TODO(gen): `api.d.ts` todavía no tiene `SaleResource`. Se escribe a mano y
// se reemplaza al correr `npm run gen -w packages/types`.

import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
import type { SALE_PAYMENT_METHODS, SALE_STATUSES } from "./sales.constants";

export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number];
export type SaleStatus = (typeof SALE_STATUSES)[number];

export interface SaleBranchRef {
  id: number;
  name: string;
}

export interface SaleMemberRef {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface SaleStaffRef {
  id: number;
  first_name: string;
  last_name: string;
}

export interface SaleItemProductRef {
  id: number;
  name: string;
  sku: string;
}

export interface SaleItemRow {
  id: number;
  product_id: number;
  product: SaleItemProductRef | null;
  quantity: number;
  /** Precio con el que se vendió; no cambia aunque el producto suba de precio después. */
  unit_price: number;
  subtotal: number;
}

export interface SaleRow {
  id: number;
  payment_method: SalePaymentMethod;
  payment_reference: string | null;
  subtotal: number;
  total: number;
  status: SaleStatus;
  branch_id: number;
  branch: SaleBranchRef | null;
  /** `null` = venta a visitante (sin socio). */
  member_id: number | null;
  member: SaleMemberRef | null;
  staff_id: number | null;
  staff: SaleStaffRef | null;
  items: SaleItemRow[];
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleListParams extends BaseListParams {
  branch_id?: string;
  member_id?: string;
  staff_id?: string;
  payment_method?: SalePaymentMethod;
  status?: SaleStatus;
  /** `created_at >=` (fecha-hora: incluye desde las 00:00:00 de ese día). */
  date_from?: string;
  /** `created_at <=` (fecha-hora: usa `YYYY-MM-DD 23:59:59` para incluir el día completo). */
  date_to?: string;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type SaleFilters = ListFilters<SaleListParams>;

export interface SaleItemInput {
  product_id: number;
  quantity: number;
}

/** Cuerpo de `POST /sales`. No se envían precios: el backend usa el `sale_price` actual. */
export interface CreateSaleInput {
  branch_id: number;
  member_id?: number | null;
  payment_method: SalePaymentMethod;
  payment_reference?: string | null;
  items: SaleItemInput[];
}

/** Cuerpo de `PATCH /sales/{id}/void`. */
export interface VoidSaleInput {
  void_reason: string;
}
