// TODO(gen): `api.d.ts` todavía no tiene `SaleResource`. Se escribe a mano y
// se reemplaza al correr `npm run gen -w packages/types`.

import type { SALE_PAYMENT_METHODS, SALE_STATUSES } from "./sales.constants";

export type SalePaymentMethod = (typeof SALE_PAYMENT_METHODS)[number];
export type SaleStatus = (typeof SALE_STATUSES)[number];

export interface SaleBranchRef {
  id: string;
  name: string;
}

export interface SaleMemberRef {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface SaleStaffRef {
  id: string;
  first_name: string;
  last_name: string;
}

export interface SaleItemProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface SaleItemRow {
  id: string;
  product_id: string;
  product: SaleItemProductRef | null;
  quantity: number;
  /** Precio con el que se vendió; no cambia aunque el producto suba de precio después. */
  unit_price: number;
  subtotal: number;
}

export interface SaleRow {
  id: string;
  payment_method: SalePaymentMethod;
  payment_reference: string | null;
  subtotal: number;
  total: number;
  status: SaleStatus;
  branch_id: string;
  branch: SaleBranchRef | null;
  /** `null` = venta a visitante (sin socio). */
  member_id: string | null;
  member: SaleMemberRef | null;
  staff_id: string | null;
  staff: SaleStaffRef | null;
  items: SaleItemRow[];
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleListParams {
  page?: number;
  perPage?: number;
  branchId?: string;
  memberId?: string;
  staffId?: string;
  paymentMethod?: SalePaymentMethod;
  status?: SaleStatus;
  /** `created_at >=` (fecha-hora: incluye desde las 00:00:00 de ese día). */
  dateFrom?: string;
  /** `created_at <=` (fecha-hora: usa `YYYY-MM-DD 23:59:59` para incluir el día completo). */
  dateTo?: string;
}

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
