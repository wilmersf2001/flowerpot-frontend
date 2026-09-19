import { StockMovementListParams } from "./stock-movements.types";

/** Fábrica de query-keys de React Query para el módulo de movimientos de stock. */
export const stockMovementKeys = {
  all: ["stock-movements"] as const,
  lists: () => [...stockMovementKeys.all, "list"] as const,
  list: (params: StockMovementListParams) => [...stockMovementKeys.lists(), params] as const,
};
