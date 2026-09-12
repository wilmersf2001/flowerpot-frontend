import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
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
function toExpenseCategoryRow(raw: Record<string, unknown>): ExpenseCategoryRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

async function list(
  params: ExpenseCategoryListParams = {},
): Promise<Paginated<ExpenseCategoryRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(EXPENSE_CATEGORIES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? EXPENSE_CATEGORIES_PER_PAGE,
      search: search ? search : undefined,
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toExpenseCategoryRow) };
}

async function create(input: CreateExpenseCategoryInput): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.post<unknown>(EXPENSE_CATEGORIES_ENDPOINT, input);
  return toExpenseCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateExpenseCategoryInput,
): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toExpenseCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Activa/desactiva la categoría (`PATCH /expense-categories/{id}/toggle-active`). */
async function toggleActive(id: string): Promise<ExpenseCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSE_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/toggle-active`,
  );
  return toExpenseCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const expenseCategoriesApi = { list, create, update, remove, toggleActive };
