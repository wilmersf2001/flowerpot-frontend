import { PurchaseOrderListParams } from "./purchase-orders.types";

/** Fábrica de query-keys de React Query para el módulo de órdenes de compra. */
export const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (params: PurchaseOrderListParams) => [...purchaseOrderKeys.lists(), params] as const,
};
