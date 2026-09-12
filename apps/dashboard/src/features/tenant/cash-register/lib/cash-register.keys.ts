import { CashMovementListParams, CashRegisterListParams } from "./cash-register.types";

/**
 * Fábrica de query-keys de React Query para el módulo de caja. Todas las keys
 * cuelgan de `"cash-register"` a propósito: el módulo de gastos invalida esta
 * misma raíz cuando aprobar/anular un gasto en efectivo mueve la caja.
 */
export const cashRegisterKeys = {
  all: ["cash-register"] as const,
  current: (branchId: string | null) => [...cashRegisterKeys.all, "current", branchId] as const,
  currentSummary: (branchId: string | null) =>
    [...cashRegisterKeys.all, "current-summary", branchId] as const,
  currentMovements: (branchId: string | null, params: CashMovementListParams) =>
    [...cashRegisterKeys.all, "current-movements", branchId, params] as const,
  history: () => [...cashRegisterKeys.all, "history"] as const,
  historyList: (params: CashRegisterListParams) => [...cashRegisterKeys.history(), params] as const,
  historyDetail: (id: string) => [...cashRegisterKeys.all, "history-detail", id] as const,
  historySummary: (id: string) => [...cashRegisterKeys.all, "history-summary", id] as const,
  historyMovements: (id: string, params: CashMovementListParams) =>
    [...cashRegisterKeys.all, "history-movements", id, params] as const,
  catalog: () => [...cashRegisterKeys.all, "catalog"] as const,
};
