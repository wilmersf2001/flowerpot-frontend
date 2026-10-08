import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  PURCHASE_ORDERS_ENDPOINT,
  PURCHASE_ORDERS_PER_PAGE,
} from "./purchase-orders.constants";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderListParams,
  PurchaseOrderRow,
  ReceivePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "./purchase-orders.types";

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `order_date`.
 */
async function list(
  params: PurchaseOrderListParams = {},
): Promise<Paginated<PurchaseOrderRow>> {
  const { data } = await apiClient.get<unknown>(PURCHASE_ORDERS_ENDPOINT, {
    params: {
      ...buildListParams(params, PURCHASE_ORDERS_PER_PAGE),
      sort_by: "order_date",
      sort_order: "desc",
    },
  });
  return unwrapPaginated<PurchaseOrderRow>(data);
}

async function show(id: number): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.get<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return unwrapEnvelope<PurchaseOrderRow>(data);
}

async function create(
  input: CreatePurchaseOrderInput,
): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.post<unknown>(
    PURCHASE_ORDERS_ENDPOINT,
    input,
  );
  return unwrapEnvelope<PurchaseOrderRow>(data);
}

/** Solo permitido si la orden está `pending`. */
async function update(
  id: number,
  input: UpdatePurchaseOrderInput,
): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<PurchaseOrderRow>(data);
}

/** Soft delete. Solo permitido si la orden está `pending`. */
async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura una orden eliminada (soft-delete). La respuesta no trae el recurso. */
async function restore(id: number): Promise<void> {
  await apiClient.post(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
}

/**
 * Marca la orden como recibida: sube el stock de la sede, actualiza el costo
 * de cada producto y crea los movimientos "compra". Irreversible.
 */
async function receive(
  id: number,
  input: ReceivePurchaseOrderInput = {},
): Promise<PurchaseOrderRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PURCHASE_ORDERS_ENDPOINT}/${encodeURIComponent(id)}/receive`,
    input,
  );
  return unwrapEnvelope<PurchaseOrderRow>(data);
}

export const purchaseOrdersApi = {
  list,
  show,
  create,
  update,
  remove,
  restore,
  receive,
};
