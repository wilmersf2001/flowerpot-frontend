import { SaleListParams } from "./sales.types";

/** Fábrica de query-keys de React Query para el módulo de ventas de tienda. */
export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (params: SaleListParams) => [...saleKeys.lists(), params] as const,
};
