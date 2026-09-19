import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { cashRegisterKeys } from "@/features/tenant/cash-register";
import { productKeys } from "@/features/tenant/products";
import { stockMovementKeys } from "@/features/tenant/stock-movements";
import { salesApi } from "./sales.api";
import { saleKeys } from "./sales.keys";
import { CreateSaleInput, SaleListParams, SaleRow, VoidSaleInput } from "./sales.types";

/** Lista paginada de ventas, con filtros opcionales. */
export function useSales(params: SaleListParams = {}) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => salesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Registra una venta en la sede activa del switcher global: descuenta stock,
 * registra el movimiento "venta" e ingresa el importe a la caja abierta de
 * esa sede (si hay una abierta). Por eso, además de las ventas, invalida
 * productos (stock), el Kardex y la caja.
 */
export function useCreateSale() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: Omit<CreateSaleInput, "branch_id">) => {
      if (!selectedBranchId) throw new Error("No hay una sede activa seleccionada.");
      return salesApi.create({ ...input, branch_id: Number(selectedBranchId) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.all });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
    },
  });
}

/** Solo válido si la venta está `completed`. Repone stock y revierte el ingreso en caja. Irreversible. */
export function useVoidSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VoidSaleInput }) =>
      salesApi.voidSale(id, input),
    onSuccess: (_result: SaleRow) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.all });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
    },
  });
}
