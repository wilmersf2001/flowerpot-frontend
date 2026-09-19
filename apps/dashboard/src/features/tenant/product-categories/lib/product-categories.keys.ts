import { ProductCategoryListParams } from "./product-categories.types";

/** Fábrica de query-keys de React Query para el módulo de categorías de producto. */
export const productCategoryKeys = {
  all: ["product-categories"] as const,
  lists: () => [...productCategoryKeys.all, "list"] as const,
  list: (params: ProductCategoryListParams) => [...productCategoryKeys.lists(), params] as const,
  options: (search: string) => [...productCategoryKeys.all, "options", search] as const,
};
