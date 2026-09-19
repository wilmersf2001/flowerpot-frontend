// TODO(gen): `api.d.ts` todavía no tiene `PurchaseOrderResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { PURCHASE_ORDER_STATUSES } from "./purchase-orders.constants";

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

/** Proveedor o sede referenciados desde una orden de compra. */
export interface PurchaseOrderPartyRef {
  id: string;
  name: string;
}

export interface PurchaseOrderStaffRef {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PurchaseOrderItemProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface PurchaseOrderItemRow {
  id: string;
  product_id: string;
  /** `null` si el producto fue eliminado. */
  product: PurchaseOrderItemProductRef | null;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface PurchaseOrderRow {
  id: string;
  /** Fecha pura `YYYY-MM-DD`. */
  order_date: string;
  status: PurchaseOrderStatus;
  total: number;
  supplier_id: string;
  supplier: PurchaseOrderPartyRef | null;
  branch_id: string;
  branch: PurchaseOrderPartyRef | null;
  staff_id: string | null;
  staff: PurchaseOrderStaffRef | null;
  items: PurchaseOrderItemRow[];
  /** Fecha-hora ISO 8601, o `null` mientras esté `pending`. */
  received_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseOrderListParams {
  page?: number;
  perPage?: number;
  supplierId?: string;
  branchId?: string;
  status?: PurchaseOrderStatus;
  /** `order_date >=` (inclusive). */
  dateFrom?: string;
  /** `order_date <=` (inclusive). */
  dateTo?: string;
}

export interface PurchaseOrderItemInput {
  product_id: number;
  quantity: number;
  unit_cost: number;
}

/** Cuerpo de `POST /purchase-orders`. */
export interface CreatePurchaseOrderInput {
  supplier_id: number;
  branch_id: number;
  order_date: string;
  items: PurchaseOrderItemInput[];
}

/**
 * Cuerpo de `PATCH /purchase-orders/{id}`. Solo válido si la orden está
 * `pending`. Si se envía `items`, reemplaza la lista completa (no es merge).
 */
export interface UpdatePurchaseOrderInput {
  supplier_id?: number;
  branch_id?: number;
  order_date?: string;
  items?: PurchaseOrderItemInput[];
}

/** Cuerpo de `PATCH /purchase-orders/{id}/receive`. Puede ir vacío. */
export interface ReceivePurchaseOrderInput {
  received_at?: string;
}
