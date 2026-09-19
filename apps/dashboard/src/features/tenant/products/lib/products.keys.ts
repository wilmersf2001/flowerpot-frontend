import { ProductListParams } from "./products.types";

/** Fábrica de query-keys de React Query para el módulo de productos. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  options: (search: string) => [...productKeys.all, "options", search] as const,
};
