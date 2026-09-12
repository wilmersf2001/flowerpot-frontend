/** Fila de `GET /expense-categories` (`ExpenseCategoryResource`). */
export interface ExpenseCategoryRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategoryListParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

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
