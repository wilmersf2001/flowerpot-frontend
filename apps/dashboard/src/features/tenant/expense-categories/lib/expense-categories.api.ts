import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  EXPENSE_CATEGORIES_ENDPOINT,
  EXPENSE_CATEGORIES_PER_PAGE,
} from "./expense-categories.constants";
import {
  CreateExpenseCategoryInput,
  ExpenseCategoryListParams,
  ExpenseCategoryRow,
  UpdateExpenseCategoryInput,
} from "./expense-categories.types";

async function list(
  params: ExpenseCategoryListParams = {},
): Promise<Paginated<ExpenseCategoryRow>> {
  const { data } = await apiClient.get<unknown>(EXPENSE_CATEGORIES_ENDPOINT, {
    params: buildListParams(params, EXPENSE_CATEGORIES_PER_PAGE),
  });
  return unwrapPaginated<ExpenseCategoryRow>(data);
}

async function create(
  input: CreateExpenseCategoryInput,
): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.post<unknown>(
    EXPENSE_CATEGORIES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<ExpenseCategoryRow>(data);
}

async function update(
  id: string,
  input: UpdateExpenseCategoryInput,
): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ExpenseCategoryRow>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Activa/desactiva la categoría (`PATCH /expense-categories/{id}/toggle-active`). */
async function toggleActive(id: string): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/toggle-active`,
  );
  return unwrapEnvelope<ExpenseCategoryRow>(data);
}

export const expenseCategoriesApi = {
  list,
  create,
  update,
  remove,
  toggleActive,
};
