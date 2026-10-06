import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { toBoolean } from "@/features/_shared/format";
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

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function withActive(row: ExpenseCategoryRow): ExpenseCategoryRow {
  return { ...row, is_active: toBoolean(row.is_active) };
}

async function list(
  params: ExpenseCategoryListParams = {},
): Promise<Paginated<ExpenseCategoryRow>> {
  const { data } = await apiClient.get<unknown>(EXPENSE_CATEGORIES_ENDPOINT, {
    params: {
      ...buildListParams(params, EXPENSE_CATEGORIES_PER_PAGE),
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<ExpenseCategoryRow>(data);
  return { ...page, data: page.data.map(withActive) };
}

async function create(input: CreateExpenseCategoryInput): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.post<unknown>(EXPENSE_CATEGORIES_ENDPOINT, input);
  return withActive(unwrapEnvelope<ExpenseCategoryRow>(data));
}

async function update(
  id: string,
  input: UpdateExpenseCategoryInput,
): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return withActive(unwrapEnvelope<ExpenseCategoryRow>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Activa/desactiva la categoría (`PATCH /expense-categories/{id}/toggle-active`). */
async function toggleActive(id: string): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/toggle-active`,
  );
  return withActive(unwrapEnvelope<ExpenseCategoryRow>(data));
}

export const expenseCategoriesApi = { list, create, update, remove, toggleActive };
