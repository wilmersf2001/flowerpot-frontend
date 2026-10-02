import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { EXPENSES_ENDPOINT, EXPENSES_PER_PAGE } from "./expenses.constants";
import {
  CreateExpenseInput,
  ExpenseListParams,
  ExpenseRow,
  ExpenseSummary,
  ExpenseSummaryParams,
  ReviewExpenseInput,
  UpdateExpenseInput,
  VoidExpenseInput,
} from "./expenses.types";

async function list(params: ExpenseListParams = {}): Promise<Paginated<ExpenseRow>> {
  const { data } = await apiClient.get<unknown>(EXPENSES_ENDPOINT, {
    params: buildListParams(params, EXPENSES_PER_PAGE),
  });
  return unwrapPaginated<ExpenseRow>(data);
}

async function create(input: CreateExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(EXPENSES_ENDPOINT, input);
  return unwrapEnvelope<ExpenseRow>(data);
}

async function update(id: number, input: UpdateExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ExpenseRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`);
}

async function restore(id: number): Promise<void> {
  await apiClient.post<unknown>(`${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/restore`);
}

async function review(id: number, input: ReviewExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/review`,
    input,
  );
  return unwrapEnvelope<ExpenseRow>(data);
}

async function voidExpense(id: number, input: VoidExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/void`,
    input,
  );
  return unwrapEnvelope<ExpenseRow>(data);
}

async function summary(params: ExpenseSummaryParams = {}): Promise<ExpenseSummary> {
  const { data } = await apiClient.get<unknown>(`${EXPENSES_ENDPOINT}/summary`, {
    params: {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      branch_id: params.branchId || undefined,
      expense_category_id: params.expenseCategoryId || undefined,
    },
  });
  return unwrapEnvelope<ExpenseSummary>(data);
}

export const expensesApi = { list, create, update, remove, restore, review, void: voidExpense, summary };
