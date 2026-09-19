// TODO(gen): `api.d.ts` todavía no tiene `StockMovementResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { STOCK_MOVEMENT_TYPES } from "./stock-movements.constants";

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface StockMovementProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface StockMovementBranchRef {
  id: string;
  name: string;
}

export interface StockMovementStaffRef {
  id: string;
  first_name: string;
  last_name: string;
}

/**
 * Historial de auditoría de un cambio de stock. Es de solo lectura: no hay
 * crear/editar/eliminar, ni `updated_at` (nunca se modifica tras crearse).
 */
export interface StockMovementRow {
  id: string;
  type: StockMovementType;
  /** Entero con signo: negativo = salió stock, positivo = entró. */
  quantity: number;
  /** Reservado para `ajuste`; hoy siempre `null`. */
  reason: string | null;
  product_id: string;
  product: StockMovementProductRef | null;
  branch_id: string;
  branch: StockMovementBranchRef | null;
  staff_id: string | null;
  staff: StockMovementStaffRef | null;
  /** P. ej. `"App\\Models\\Tenant\\Sale"` o `"...\\PurchaseOrder"`. */
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface StockMovementListParams {
  page?: number;
  perPage?: number;
  productId?: string;
  branchId?: string;
  type?: StockMovementType;
  /** `created_at >=` (fecha-hora: incluye desde las 00:00:00 de ese día). */
  dateFrom?: string;
  /** `created_at <=` (fecha-hora: usa `YYYY-MM-DD 23:59:59` para incluir el día completo). */
  dateTo?: string;
}
