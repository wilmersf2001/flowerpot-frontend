import { ExpenseCategoryListParams } from "./expense-categories.types";

/** Fábrica de query-keys de React Query para el módulo de categorías de gasto. */
export const expenseCategoryKeys = {
  all: ["expense-categories"] as const,
  lists: () => [...expenseCategoryKeys.all, "list"] as const,
  list: (params: ExpenseCategoryListParams) => [...expenseCategoryKeys.lists(), params] as const,
  options: (search: string) => [...expenseCategoryKeys.all, "options", search] as const,
};
