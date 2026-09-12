import type { EXPENSE_PAYMENT_METHODS, EXPENSE_STATUSES } from "./expenses.constants";

export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHODS)[number];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

/** Fila de `GET /expenses` (`ExpenseResource`). */
export interface ExpenseRow {
  id: string;
  expense_category_id: string;
  branch_id: string;
  date: string;
  amount: number;
  description: string;
  reference_number: string | null;
  payment_method: ExpensePaymentMethod;
  attachment_url: string | null;
  status: ExpenseStatus;
  approval_notes: string | null;
  approved_at: string | null;
  void_reason: string | null;
  voided_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  /** Solo si el backend cargó la relación (`whenLoaded`). */
  category_name?: string;
  branch_name?: string;
  registered_by_name?: string;
  approved_by_name?: string;
}

export interface ExpenseListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: ExpenseStatus;
  paymentMethod?: ExpensePaymentMethod;
  expenseCategoryId?: string;
  /** Sede activa (switcher global). `useExpenses` la inyecta; no la pasa la página. */
  branchId?: string | null;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

/** Cuerpo de `POST /expenses` (`StoreExpenseRequest`). */
export interface CreateExpenseInput {
  expense_category_id: number;
  branch_id?: number | null;
  amount: number;
  description: string;
  payment_method: ExpensePaymentMethod;
  date: string;
  reference_number?: string | null;
  attachment_url?: string | null;
  notes?: string | null;
}

/** Cuerpo de `PATCH /expenses/{id}` (`UpdateExpenseRequest`). Solo si `status === "pending"`. */
export interface UpdateExpenseInput {
  expense_category_id?: number;
  amount?: number;
  description?: string;
  payment_method?: ExpensePaymentMethod;
  date?: string;
  reference_number?: string | null;
  attachment_url?: string | null;
  notes?: string | null;
}

/** Cuerpo de `POST /expenses/{id}/review` (`ReviewExpenseRequest`). */
export interface ReviewExpenseInput {
  action: "approve" | "reject";
  notes?: string | null;
}

/** Cuerpo de `POST /expenses/{id}/void` (`VoidExpenseRequest`). */
export interface VoidExpenseInput {
  void_reason: string;
}

/** `GET /expenses/summary`. */
export interface ExpenseSummaryParams {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string | null;
  expenseCategoryId?: string;
}

export interface ExpenseSummaryByCategory {
  category_id: string;
  category_name: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  total: number;
  total_pending: number;
  total_approved: number;
  count: number;
  count_pending: number;
  count_approved: number;
  by_category: ExpenseSummaryByCategory[];
  by_payment_method: Record<string, number>;
  by_status: Record<string, number>;
}
