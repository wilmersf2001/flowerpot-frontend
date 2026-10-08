import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

/** Fila de `GET /expense-categories` (`ExpenseCategoryResource`). */
export interface ExpenseCategoryRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategoryListParams extends BaseListParams {
  is_active?: boolean;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type ExpenseCategoryFilters = ListFilters<ExpenseCategoryListParams>;

/** Cuerpo de `POST /expense-categories` (`StoreExpenseCategoryRequest`). */
export interface CreateExpenseCategoryInput {
  name: string;
  description?: string | null;
}

/** Cuerpo de `PATCH /expense-categories/{id}` (`UpdateExpenseCategoryRequest`). */
export interface UpdateExpenseCategoryInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}
