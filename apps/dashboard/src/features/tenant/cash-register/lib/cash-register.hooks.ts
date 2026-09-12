import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { cashRegisterApi } from "./cash-register.api";
import { cashRegisterKeys } from "./cash-register.keys";
import {
  CashMovementListParams,
  CashRegisterListParams,
  CloseCashRegisterInput,
  CreateCashMovementInput,
  OpenCashRegisterInput,
  VoidCashMovementInput,
} from "./cash-register.types";

/** Caja abierta de la sede activa del switcher global (o `null` si no hay ninguna). */
export function useCurrentCashRegister() {
  const { selectedBranchId } = useSelectedBranch();
  return useQuery({
    queryKey: cashRegisterKeys.current(selectedBranchId),
    queryFn: () => cashRegisterApi.current(selectedBranchId),
    enabled: selectedBranchId != null,
  });
}

/** Resumen (ingresos/egresos/balance esperado) de la caja abierta de la sede activa. */
export function useCurrentCashRegisterSummary(enabled = true) {
  const { selectedBranchId } = useSelectedBranch();
  return useQuery({
    queryKey: cashRegisterKeys.currentSummary(selectedBranchId),
    queryFn: () => cashRegisterApi.currentSummary(),
    enabled: enabled && selectedBranchId != null,
  });
}

/** Movimientos paginados de la caja abierta de la sede activa. */
export function useCurrentCashMovements(params: CashMovementListParams = {}, enabled = true) {
  const { selectedBranchId } = useSelectedBranch();
  return useQuery({
    queryKey: cashRegisterKeys.currentMovements(selectedBranchId, params),
    queryFn: () => cashRegisterApi.currentMovements(params),
    placeholderData: keepPreviousData,
    enabled: enabled && selectedBranchId != null,
  });
}

/** Abre una caja para la sede activa del switcher global. */
export function useOpenCashRegister() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: OpenCashRegisterInput) =>
      cashRegisterApi.open({
        ...input,
        branch_id: selectedBranchId ? Number(selectedBranchId) : null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all }),
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CloseCashRegisterInput) => cashRegisterApi.close(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all }),
  });
}

/** Registra un movimiento manual (venta, retiro, depósito…) en la caja abierta. */
export function useCreateCashMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCashMovementInput) => cashRegisterApi.createMovement(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all }),
  });
}

export function useVoidCashMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VoidCashMovementInput }) =>
      cashRegisterApi.voidMovement(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all }),
  });
}

/** Historial de cajas (abiertas y cerradas), acotado a la sede activa. */
export function useCashRegisterHistory(params: CashRegisterListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: CashRegisterListParams = { ...params, branchId: selectedBranchId };
  return useQuery({
    queryKey: cashRegisterKeys.historyList(listParams),
    queryFn: () => cashRegisterApi.history(listParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

/** Resumen de una caja histórica (cerrada o no) por id. */
export function useCashRegisterHistorySummary(id: string | null) {
  return useQuery({
    queryKey: cashRegisterKeys.historySummary(id ?? ""),
    queryFn: () => cashRegisterApi.historySummary(id as string),
    enabled: id != null,
  });
}

/** Movimientos paginados de una caja histórica por id. */
export function useCashRegisterHistoryMovements(
  id: string | null,
  params: CashMovementListParams = {},
) {
  return useQuery({
    queryKey: cashRegisterKeys.historyMovements(id ?? "", params),
    queryFn: () => cashRegisterApi.historyMovements(id as string, params),
    placeholderData: keepPreviousData,
    enabled: id != null,
  });
}

/** Catálogo de enums (métodos de pago, categorías…) para construir selects. */
export function useCashRegisterCatalog() {
  return useQuery({
    queryKey: cashRegisterKeys.catalog(),
    queryFn: () => cashRegisterApi.catalog(),
    staleTime: Infinity,
  });
}
