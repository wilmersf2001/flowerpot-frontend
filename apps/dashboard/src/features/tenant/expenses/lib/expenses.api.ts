import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
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

/** El backend manda varios campos numéricos/anidados con forma inconsistente. */
function toExpenseRow(raw: Record<string, unknown>): ExpenseRow {
  const category = raw.category as Record<string, unknown> | undefined;
  const branch = raw.branch as Record<string, unknown> | undefined;
  const registeredBy = raw.registered_by as Record<string, unknown> | undefined;
  const approvedBy = raw.approved_by as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    expense_category_id: String(raw.expense_category_id ?? category?.id ?? ""),
    branch_id: String(raw.branch_id ?? branch?.id ?? ""),
    date: String(raw.date ?? ""),
    amount: Number(raw.amount ?? 0),
    description: String(raw.description ?? ""),
    reference_number: raw.reference_number == null ? null : String(raw.reference_number),
    payment_method: String(raw.payment_method ?? "other") as ExpenseRow["payment_method"],
    attachment_url: raw.attachment_url == null ? null : String(raw.attachment_url),
    status: String(raw.status ?? "pending") as ExpenseRow["status"],
    approval_notes: raw.approval_notes == null ? null : String(raw.approval_notes),
    approved_at: raw.approved_at == null ? null : String(raw.approved_at),
    void_reason: raw.void_reason == null ? null : String(raw.void_reason),
    voided_at: raw.voided_at == null ? null : String(raw.voided_at),
    notes: raw.notes == null ? null : String(raw.notes),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
    category_name: category ? String(category.name ?? "") : undefined,
    branch_name: branch ? String(branch.name ?? "") : undefined,
    registered_by_name: registeredBy ? String(registeredBy.name ?? "") : undefined,
    approved_by_name: approvedBy ? String(approvedBy.name ?? "") : undefined,
  };
}

async function list(params: ExpenseListParams = {}): Promise<Paginated<ExpenseRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(EXPENSES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? EXPENSES_PER_PAGE,
      search: search ? search : undefined,
      status: params.status,
      payment_method: params.paymentMethod,
      expense_category_id: params.expenseCategoryId ? Number(params.expenseCategoryId) : undefined,
      branch_id: params.branchId ? Number(params.branchId) : undefined,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      amount_min: params.amountMin,
      amount_max: params.amountMax,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toExpenseRow) };
}

async function create(input: CreateExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(EXPENSES_ENDPOINT, input);
  return toExpenseRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toExpenseRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un gasto eliminado (soft-delete). */
async function restore(id: string): Promise<void> {
  await apiClient.post<unknown>(`${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/restore`);
}

/** Aprueba o rechaza un gasto pendiente (`POST /expenses/{id}/review`). */
async function review(id: string, input: ReviewExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/review`,
    input,
  );
  return toExpenseRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Anula un gasto pendiente o aprobado (`POST /expenses/{id}/void`). */
async function voidExpense(id: string, input: VoidExpenseInput): Promise<ExpenseRow> {
  const { data } = await apiClient.post<unknown>(
    `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}/void`,
    input,
  );
  return toExpenseRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function summary(params: ExpenseSummaryParams = {}): Promise<ExpenseSummary> {
  const { data } = await apiClient.get<unknown>(`${EXPENSES_ENDPOINT}/summary`, {
    params: {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      branch_id: params.branchId ? Number(params.branchId) : undefined,
      expense_category_id: params.expenseCategoryId ? Number(params.expenseCategoryId) : undefined,
    },
  });
  const raw = unwrapEnvelope<Record<string, unknown>>(data);
  return {
    total: Number(raw.total ?? 0),
    total_pending: Number(raw.total_pending ?? 0),
    total_approved: Number(raw.total_approved ?? 0),
    count: Number(raw.count ?? 0),
    count_pending: Number(raw.count_pending ?? 0),
    count_approved: Number(raw.count_approved ?? 0),
    by_category: Array.isArray(raw.by_category)
      ? (raw.by_category as Record<string, unknown>[]).map((entry) => ({
          category_id: String(entry.category_id ?? ""),
          category_name: String(entry.category_name ?? ""),
          total: Number(entry.total ?? 0),
          count: Number(entry.count ?? 0),
        }))
      : [],
    by_payment_method: (raw.by_payment_method as Record<string, number>) ?? {},
    by_status: (raw.by_status as Record<string, number>) ?? {},
  };
}

export const expensesApi = { list, create, update, remove, restore, review, void: voidExpense, summary };
