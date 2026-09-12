import { apiClient, ApiError, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  CASH_MOVEMENTS_ENDPOINT,
  CASH_MOVEMENTS_PER_PAGE,
  CASH_REGISTER_CLOSE_ENDPOINT,
  CASH_REGISTER_CURRENT_ENDPOINT,
  CASH_REGISTER_OPEN_ENDPOINT,
  CASH_REGISTERS_ENDPOINT,
  CASH_REGISTERS_PER_PAGE,
} from "./cash-register.constants";
import {
  CashMovementListParams,
  CashMovementRow,
  CashRegisterCatalog,
  CashRegisterListParams,
  CashRegisterRow,
  CashRegisterSummary,
  CloseCashRegisterInput,
  CreateCashMovementInput,
  OpenCashRegisterInput,
  VoidCashMovementInput,
} from "./cash-register.types";

/** El backend manda varios campos numéricos/anidados con forma inconsistente. */
function toCashRegisterRow(raw: Record<string, unknown>): CashRegisterRow {
  const branch = raw.branch as Record<string, unknown> | undefined;
  const openedBy = raw.opened_by_user as Record<string, unknown> | undefined;
  const closedBy = raw.closed_by_user as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    branch_id: String(raw.branch_id ?? branch?.id ?? ""),
    opened_by: raw.opened_by == null ? null : String(raw.opened_by),
    closed_by: raw.closed_by == null ? null : String(raw.closed_by),
    status: String(raw.status ?? "open") as CashRegisterRow["status"],
    opening_amount: Number(raw.opening_amount ?? 0),
    closing_amount: raw.closing_amount == null ? null : Number(raw.closing_amount),
    current_balance: Number(raw.current_balance ?? 0),
    difference: raw.difference == null ? null : Number(raw.difference),
    opened_at: String(raw.opened_at ?? ""),
    closed_at: raw.closed_at == null ? null : String(raw.closed_at),
    opening_notes: raw.opening_notes == null ? null : String(raw.opening_notes),
    closing_notes: raw.closing_notes == null ? null : String(raw.closing_notes),
    branch_name: branch ? String(branch.name ?? "") : undefined,
    opened_by_name: openedBy ? String(openedBy.name ?? "") : undefined,
    closed_by_name: closedBy ? String(closedBy.name ?? "") : undefined,
  };
}

function toCashMovementRow(raw: Record<string, unknown>): CashMovementRow {
  const recordedBy = raw.recorded_by as Record<string, unknown> | undefined;
  const expense = raw.expense as Record<string, unknown> | undefined;
  const expenseCategory = expense?.category as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    cash_register_id: String(raw.cash_register_id ?? ""),
    expense_id: raw.expense_id == null ? null : String(raw.expense_id),
    installment_id: raw.installment_id == null ? null : String(raw.installment_id),
    type: String(raw.type ?? "expense") as CashMovementRow["type"],
    category: raw.category == null ? null : String(raw.category),
    payment_method: String(raw.payment_method ?? "cash") as CashMovementRow["payment_method"],
    amount: Number(raw.amount ?? 0),
    description: String(raw.description ?? ""),
    reference: raw.reference == null ? null : String(raw.reference),
    is_automatic: raw.is_automatic === true || raw.is_automatic === "true" || raw.is_automatic === 1,
    is_voided: raw.is_voided === true || raw.is_voided === "true" || raw.is_voided === 1,
    void_reason: raw.void_reason == null ? null : String(raw.void_reason),
    movement_at: String(raw.movement_at ?? ""),
    created_at: String(raw.created_at ?? ""),
    recorded_by_name: recordedBy ? String(recordedBy.name ?? "") : undefined,
    expense_description: expense ? String(expense.description ?? "") : undefined,
    expense_category_name: expenseCategory ? String(expenseCategory.name ?? "") : undefined,
  };
}

function toCashRegisterSummary(raw: Record<string, unknown>): CashRegisterSummary {
  const register = raw.cash_register as Record<string, unknown>;
  const summary = raw.summary as Record<string, unknown>;
  return {
    cash_register: {
      id: String(register.id),
      status: String(register.status ?? "open") as CashRegisterRow["status"],
      opening_amount: Number(register.opening_amount ?? 0),
      current_balance: Number(register.current_balance ?? 0),
      opened_at: String(register.opened_at ?? ""),
    },
    summary: {
      total_income: Number(summary.total_income ?? 0),
      total_expense: Number(summary.total_expense ?? 0),
      net_movement: Number(summary.net_movement ?? 0),
      expected_cash: Number(summary.expected_cash ?? 0),
      movements_count: Number(summary.movements_count ?? 0),
      movements_count_income: Number(summary.movements_count_income ?? 0),
      movements_count_expense: Number(summary.movements_count_expense ?? 0),
      by_payment_method: (summary.by_payment_method as Record<string, number>) ?? {},
      by_income_category: (summary.by_income_category as Record<string, number>) ?? {},
      by_expense_category: (summary.by_expense_category as Record<string, number>) ?? {},
      automatic_movements: Number(summary.automatic_movements ?? 0),
      manual_movements: Number(summary.manual_movements ?? 0),
    },
  };
}

/** Caja abierta de la sede activa, o `null` si no hay ninguna (404). */
async function current(branchId?: string | null): Promise<CashRegisterRow | null> {
  try {
    const { data } = await apiClient.get<unknown>(CASH_REGISTER_CURRENT_ENDPOINT, {
      params: { branch_id: branchId ? Number(branchId) : undefined },
    });
    return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function open(input: OpenCashRegisterInput): Promise<CashRegisterRow> {
  const { data } = await apiClient.post<unknown>(CASH_REGISTER_OPEN_ENDPOINT, input);
  return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function close(input: CloseCashRegisterInput): Promise<CashRegisterRow> {
  const { data } = await apiClient.post<unknown>(CASH_REGISTER_CLOSE_ENDPOINT, input);
  return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function currentSummary(): Promise<CashRegisterSummary> {
  const { data } = await apiClient.get<unknown>(`${CASH_REGISTER_CURRENT_ENDPOINT}/summary`);
  return toCashRegisterSummary(unwrapEnvelope<Record<string, unknown>>(data));
}

async function currentMovements(
  params: CashMovementListParams = {},
): Promise<Paginated<CashMovementRow>> {
  const { data } = await apiClient.get<unknown>(`${CASH_REGISTER_CURRENT_ENDPOINT}/movements`, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? CASH_MOVEMENTS_PER_PAGE,
      type: params.type,
      category: params.category,
      payment_method: params.paymentMethod,
      is_voided: params.isVoided,
      is_automatic: params.isAutomatic,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toCashMovementRow) };
}

async function history(params: CashRegisterListParams = {}): Promise<Paginated<CashRegisterRow>> {
  const { data } = await apiClient.get<unknown>(CASH_REGISTERS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? CASH_REGISTERS_PER_PAGE,
      status: params.status,
      branch_id: params.branchId ? Number(params.branchId) : undefined,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toCashRegisterRow) };
}

async function historyDetail(id: string): Promise<CashRegisterRow> {
  const { data } = await apiClient.get<unknown>(
    `${CASH_REGISTERS_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function historySummary(id: string): Promise<CashRegisterSummary> {
  const { data } = await apiClient.get<unknown>(
    `${CASH_REGISTERS_ENDPOINT}/${encodeURIComponent(id)}/summary`,
  );
  return toCashRegisterSummary(unwrapEnvelope<Record<string, unknown>>(data));
}

async function historyMovements(
  id: string,
  params: CashMovementListParams = {},
): Promise<Paginated<CashMovementRow>> {
  const { data } = await apiClient.get<unknown>(
    `${CASH_REGISTERS_ENDPOINT}/${encodeURIComponent(id)}/movements`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? CASH_MOVEMENTS_PER_PAGE,
        type: params.type,
        category: params.category,
        payment_method: params.paymentMethod,
        is_voided: params.isVoided,
        is_automatic: params.isAutomatic,
      },
    },
  );
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toCashMovementRow) };
}

async function createMovement(input: CreateCashMovementInput): Promise<CashMovementRow> {
  const { data } = await apiClient.post<unknown>(CASH_MOVEMENTS_ENDPOINT, input);
  return toCashMovementRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function voidMovement(id: string, input: VoidCashMovementInput): Promise<CashMovementRow> {
  const { data } = await apiClient.delete<unknown>(
    `${CASH_MOVEMENTS_ENDPOINT}/${encodeURIComponent(id)}`,
    { data: input },
  );
  return toCashMovementRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function catalog(): Promise<CashRegisterCatalog> {
  const { data } = await apiClient.get<unknown>("/cash-register/catalog");
  const raw = unwrapEnvelope<Record<string, unknown>>(data);
  return {
    payment_methods: (raw.payment_methods as string[]) ?? [],
    income_categories: (raw.income_categories as string[]) ?? [],
    expense_categories: (raw.expense_categories as string[]) ?? [],
    physical_cash_methods: (raw.physical_cash_methods as string[]) ?? [],
    statuses: (raw.statuses as string[]) ?? [],
  };
}

export const cashRegisterApi = {
  current,
  open,
  close,
  currentSummary,
  currentMovements,
  history,
  historyDetail,
  historySummary,
  historyMovements,
  createMovement,
  voidMovement,
  catalog,
};
