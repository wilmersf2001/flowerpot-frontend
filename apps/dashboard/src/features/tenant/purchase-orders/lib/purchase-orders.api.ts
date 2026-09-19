import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { PURCHASE_ORDERS_ENDPOINT, PURCHASE_ORDERS_PER_PAGE } from "./purchase-orders.constants";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderItemRow,
  PurchaseOrderListParams,
  PurchaseOrderPartyRef,
  PurchaseOrderRow,
  PurchaseOrderStaffRef,
  ReceivePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "./purchase-orders.types";

function toPartyRef(raw: unknown): PurchaseOrderPartyRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return { id: String(r.id), name: String(r.name ?? "") };
}

function toStaffRef(raw: unknown): PurchaseOrderStaffRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    first_name: String(r.first_name ?? ""),
    last_name: String(r.last_name ?? ""),
  };
}

function toItemRow(raw: unknown): PurchaseOrderItemRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  const product = r.product as Record<string, unknown> | null | undefined;
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    product: product
      ? { id: String(product.id), name: String(product.name ?? ""), sku: String(product.sku ?? "") }
      : null,
    quantity: Number(r.quantity ?? 0),
    unit_cost: Number(r.unit_cost ?? 0),
    subtotal: Number(r.subtotal ?? 0),
  };
}

function toPurchaseOrderRow(raw: Record<string, unknown>): PurchaseOrderRow {
  return {
    id: String(raw.id),
    order_date: String(raw.order_date ?? ""),
    status: (raw.status as PurchaseOrderRow["status"]) ?? "pending",
    total: Number(raw.total ?? 0),
    supplier_id: String(raw.supplier_id),
    supplier: toPartyRef(raw.supplier),
    branch_id: String(raw.branch_id),
    branch: toPartyRef(raw.branch),
    staff_id: raw.staff_id == null ? null : String(raw.staff_id),
    staff: toStaffRef(raw.staff),
    items: Array.isArray(raw.items) ? raw.items.map(toItemRow) : [],
    received_at: raw.received_at == null ? null : String(raw.received_at),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `order_date`.
 */
async function list(params: PurchaseOrderListParams = {}): Promise<Paginated<PurchaseOrderRow>> {
  const { data } = await apiClient.get<unknown>(PURCHASE_ORDERS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? PURCHASE_ORDERS_PER_PAGE,
      supplier_id: params.supplierId || undefined,
      branch_id: params.branchId || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
      sort_by: "order_date",
      sort_order: "desc",
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toPurchaseOrderRow) };
}

async function show(id: string): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.get<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return toPurchaseOrderRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function create(input: CreatePurchaseOrderInput): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.post<unknown>(PURCHASE_ORDERS_ENDPOINT, input);
  return toPurchaseOrderRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Solo permitido si la orden está `pending`. */
async function update(id: string, input: UpdatePurchaseOrderInput): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toPurchaseOrderRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Soft delete. Solo permitido si la orden está `pending`. */
async function remove(id: string): Promise<void> {
  await apiClient.delete(`${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una orden eliminada (soft-delete). La respuesta no trae el recurso. */
async function restore(id: string): Promise<void> {
  await apiClient.post(`${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}/restore`);
}

/**
 * Marca la orden como recibida: sube el stock de la sede, actualiza el costo
 * de cada producto y crea los movimientos "compra". Irreversible.
 */
async function receive(
  id: string,
  input: ReceivePurchaseOrderInput = {},
): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}/receive`,
    input,
  );
  return toPurchaseOrderRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const purchaseOrdersApi = { list, show, create, update, remove, restore, receive };
