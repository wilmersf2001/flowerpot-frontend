import {
  apiClient,
  ApiError,
  unwrapEnvelope,
  unwrapPaginated,
} from "@repo/api-client";
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
    opening_balance: Number(raw.opening_balance ?? 0),
    closing_amount:
      raw.closing_amount == null ? null : Number(raw.closing_amount),
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
  const expenseCategory = expense?.category as
    Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    cash_register_id: String(raw.cash_register_id ?? ""),
    expense_id: raw.expense_id == null ? null : String(raw.expense_id),
    installment_id:
      raw.installment_id == null ? null : String(raw.installment_id),
    type: String(raw.type ?? "expense") as CashMovementRow["type"],
    category: raw.category == null ? null : String(raw.category),
    payment_method: String(
      raw.payment_method ?? "cash",
    ) as CashMovementRow["payment_method"],
    amount: Number(raw.amount ?? 0),
    description: String(raw.description ?? ""),
    reference: raw.reference == null ? null : String(raw.reference),
    is_automatic:
      raw.is_automatic === true ||
      raw.is_automatic === "true" ||
      raw.is_automatic === 1,
    is_voided:
      raw.is_voided === true || raw.is_voided === "true" || raw.is_voided === 1,
    void_reason: raw.void_reason == null ? null : String(raw.void_reason),
    movement_at: String(raw.movement_at ?? ""),
    created_at: String(raw.created_at ?? ""),
    recorded_by_name: recordedBy ? String(recordedBy.name ?? "") : undefined,
    expense_description: expense
      ? String(expense.description ?? "")
      : undefined,
    expense_category_name: expenseCategory
      ? String(expenseCategory.name ?? "")
      : undefined,
  };
}

function toNamedRef(
  raw: unknown,
): { id: string; name: string } | null {
  if (raw == null || typeof raw !== "object") return null;
  const ref = raw as Record<string, unknown>;
  return { id: String(ref.id), name: String(ref.name ?? "") };
}

function toRecordOfNumbers(raw: unknown): Record<string, number> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, number>;
}

function toCashRegisterSummary(
  raw: Record<string, unknown>,
): CashRegisterSummary {
  const register = raw.register as Record<string, unknown>;
  const totals = raw.totals as Record<string, unknown>;
  const movementsCount = raw.movements_count as Record<string, unknown>;
  return {
    register: {
      id: String(register.id),
      status: String(register.status ?? "open") as CashRegisterRow["status"],
      branch_id: String(register.branch_id ?? ""),
      branch_name:
        register.branch_name == null ? undefined : String(register.branch_name),
      opening_balance: Number(register.opening_balance ?? 0),
      opening_notes:
        register.opening_notes == null ? null : String(register.opening_notes),
      opened_at: String(register.opened_at ?? ""),
      closed_at: register.closed_at == null ? null : String(register.closed_at),
      opened_by: toNamedRef(register.opened_by),
      closed_by: toNamedRef(register.closed_by),
    },
    totals: {
      total_income: Number(totals.total_income ?? 0),
      total_expenses: Number(totals.total_expenses ?? 0),
      net_movement: Number(totals.net_movement ?? 0),
      cash_income: Number(totals.cash_income ?? 0),
      cash_expenses: Number(totals.cash_expenses ?? 0),
      expected_cash_balance: Number(totals.expected_cash_balance ?? 0),
      closing_balance:
        totals.closing_balance == null ? null : Number(totals.closing_balance),
      expected_cash:
        totals.expected_cash == null ? null : Number(totals.expected_cash),
      cash_difference:
        totals.cash_difference == null ? null : Number(totals.cash_difference),
      difference_type:
        totals.difference_type == null ? null : String(totals.difference_type),
    },
    movements_count: {
      total: Number(movementsCount?.total ?? 0),
      income: Number(movementsCount?.income ?? 0),
      expenses: Number(movementsCount?.expenses ?? 0),
      automatic: Number(movementsCount?.automatic ?? 0),
      voided: Number(movementsCount?.voided ?? 0),
    },
    income_by_method: toRecordOfNumbers(raw.income_by_method),
    income_by_category: toRecordOfNumbers(raw.income_by_category),
    expense_by_category: toRecordOfNumbers(raw.expense_by_category),
    channel_split: {
      physical_cash: Number(
        (raw.channel_split as Record<string, unknown> | undefined)
          ?.physical_cash ?? 0,
      ),
      digital: Number(
        (raw.channel_split as Record<string, unknown> | undefined)?.digital ??
          0,
      ),
    },
  };
}

/** Caja abierta de la sede activa, o `null` si no hay ninguna (404). */
async function current(
  branchId?: string | null,
): Promise<CashRegisterRow | null> {
  try {
    const { data } = await apiClient.get<unknown>(
      CASH_REGISTER_CURRENT_ENDPOINT,
      {
        params: { branch_id: branchId ? Number(branchId) : undefined },
      },
    );
    return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function open(input: OpenCashRegisterInput): Promise<CashRegisterRow> {
  const { data } = await apiClient.post<unknown>(
    CASH_REGISTER_OPEN_ENDPOINT,
    input,
  );
  return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function close(input: CloseCashRegisterInput): Promise<CashRegisterRow> {
  const { data } = await apiClient.post<unknown>(
    CASH_REGISTER_CLOSE_ENDPOINT,
    input,
  );
  return toCashRegisterRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function currentSummary(
  branchId?: string | null,
): Promise<CashRegisterSummary> {
  const { data } = await apiClient.get<unknown>(
    `${CASH_REGISTER_CURRENT_ENDPOINT}/summary`,
    {
      params: { branch_id: branchId ? Number(branchId) : undefined },
    },
  );
  return toCashRegisterSummary(unwrapEnvelope<Record<string, unknown>>(data));
}

async function currentMovements(
  params: CashMovementListParams = {},
  branchId?: string | null,
): Promise<Paginated<CashMovementRow>> {
  const { data } = await apiClient.get<unknown>(
    `${CASH_REGISTER_CURRENT_ENDPOINT}/movements`,
    {
      params: {
        branch_id: branchId ? Number(branchId) : undefined,
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

async function history(
  params: CashRegisterListParams = {},
): Promise<Paginated<CashRegisterRow>> {
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

async function createMovement(
  input: CreateCashMovementInput,
): Promise<CashMovementRow> {
  const { data } = await apiClient.post<unknown>(
    CASH_MOVEMENTS_ENDPOINT,
    input,
  );
  return toCashMovementRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function voidMovement(
  id: string,
  input: VoidCashMovementInput,
): Promise<CashMovementRow> {
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
