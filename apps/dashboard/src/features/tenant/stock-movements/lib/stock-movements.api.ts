import { apiClient, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { STOCK_MOVEMENTS_ENDPOINT, STOCK_MOVEMENTS_PER_PAGE } from "./stock-movements.constants";
import {
  StockMovementBranchRef,
  StockMovementListParams,
  StockMovementProductRef,
  StockMovementRow,
  StockMovementStaffRef,
} from "./stock-movements.types";

function toProductRef(raw: unknown): StockMovementProductRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return { id: String(r.id), name: String(r.name ?? ""), sku: String(r.sku ?? "") };
}

function toBranchRef(raw: unknown): StockMovementBranchRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return { id: String(r.id), name: String(r.name ?? "") };
}

function toStaffRef(raw: unknown): StockMovementStaffRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    first_name: String(r.first_name ?? ""),
    last_name: String(r.last_name ?? ""),
  };
}

function toStockMovementRow(raw: Record<string, unknown>): StockMovementRow {
  return {
    id: String(raw.id),
    type: (raw.type as StockMovementRow["type"]) ?? "ajuste",
    quantity: Number(raw.quantity ?? 0),
    reason: raw.reason == null ? null : String(raw.reason),
    product_id: String(raw.product_id),
    product: toProductRef(raw.product),
    branch_id: String(raw.branch_id),
    branch: toBranchRef(raw.branch),
    staff_id: raw.staff_id == null ? null : String(raw.staff_id),
    staff: toStaffRef(raw.staff),
    reference_type: raw.reference_type == null ? null : String(raw.reference_type),
    reference_id: raw.reference_id == null ? null : String(raw.reference_id),
    created_at: String(raw.created_at ?? ""),
  };
}

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `created_at`.
 */
async function list(params: StockMovementListParams = {}): Promise<Paginated<StockMovementRow>> {
  const { data } = await apiClient.get<unknown>(STOCK_MOVEMENTS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? STOCK_MOVEMENTS_PER_PAGE,
      product_id: params.productId || undefined,
      branch_id: params.branchId || undefined,
      type: params.type || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
      sort_by: "created_at",
      sort_order: "desc",
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toStockMovementRow) };
}

export const stockMovementsApi = { list };
