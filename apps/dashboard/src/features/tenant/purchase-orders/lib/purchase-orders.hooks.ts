import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/tenant/products";
import { stockMovementKeys } from "@/features/tenant/stock-movements";
import { purchaseOrdersApi } from "./purchase-orders.api";
import { purchaseOrderKeys } from "./purchase-orders.keys";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderListParams,
  ReceivePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "./purchase-orders.types";

/** Lista paginada de órdenes de compra, con filtros opcionales. */
export function usePurchaseOrders(params: PurchaseOrderListParams = {}) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => purchaseOrdersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => purchaseOrdersApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all }),
  });
}

/** Solo válido si la orden está `pending`. */
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePurchaseOrderInput }) =>
      purchaseOrdersApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all }),
  });
}

/** Soft delete. Solo válido si la orden está `pending`. */
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all }),
  });
}

export function useRestorePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all }),
  });
}

/**
 * Recibe la orden: sube el stock de la sede, actualiza el costo de cada
 * producto y crea los movimientos "compra". Irreversible desde la API, así
 * que también refresca productos (stock/costo) y el Kardex de movimientos.
 */
export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReceivePurchaseOrderInput }) =>
      purchaseOrdersApi.receive(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.all });
    },
  });
}
