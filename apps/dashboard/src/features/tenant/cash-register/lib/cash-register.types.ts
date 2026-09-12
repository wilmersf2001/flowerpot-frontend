import type {
  CASH_EXPENSE_CATEGORIES,
  CASH_INCOME_CATEGORIES,
  CASH_PAYMENT_METHODS,
  CASH_REGISTER_STATUSES,
} from "./cash-register.constants";

export type CashPaymentMethod = (typeof CASH_PAYMENT_METHODS)[number];
export type CashIncomeCategory = (typeof CASH_INCOME_CATEGORIES)[number];
export type CashExpenseCategory = (typeof CASH_EXPENSE_CATEGORIES)[number];
export type CashRegisterStatus = (typeof CASH_REGISTER_STATUSES)[number];
export type CashMovementType = "income" | "expense";

/** Fila de `GET /cash-register/current` y del historial (`CashRegisterResource`). */
export interface CashRegisterRow {
  id: string;
  branch_id: string;
  opened_by: string | null;
  closed_by: string | null;
  status: CashRegisterStatus;
  opening_amount: number;
  closing_amount: number | null;
  current_balance: number;
  difference: number | null;
  opened_at: string;
  closed_at: string | null;
  opening_notes: string | null;
  closing_notes: string | null;

  /** Solo si el backend cargó la relación (`whenLoaded`). */
  branch_name?: string;
  opened_by_name?: string;
  closed_by_name?: string;
}

export interface CashRegisterListParams {
  page?: number;
  perPage?: number;
  status?: CashRegisterStatus;
  branchId?: string | null;
  dateFrom?: string;
  dateTo?: string;
}

/** Cuerpo de `POST /cash-register/open` (`OpenCashRegisterRequest`). */
export interface OpenCashRegisterInput {
  branch_id?: number | null;
  opening_amount: number;
  notes?: string | null;
}

/** Cuerpo de `POST /cash-register/close` (`CloseCashRegisterRequest`). */
export interface CloseCashRegisterInput {
  closing_amount: number;
  notes?: string | null;
}

/** `GET /cash-register/current/summary` y `GET /cash-registers/{id}/summary`. */
export interface CashRegisterSummary {
  cash_register: {
    id: string;
    status: CashRegisterStatus;
    opening_amount: number;
    current_balance: number;
    opened_at: string;
  };
  summary: {
    total_income: number;
    total_expense: number;
    net_movement: number;
    expected_cash: number;
    movements_count: number;
    movements_count_income: number;
    movements_count_expense: number;
    by_payment_method: Record<string, number>;
    by_income_category: Record<string, number>;
    by_expense_category: Record<string, number>;
    automatic_movements: number;
    manual_movements: number;
  };
}

/** Fila de `GET /cash-register/current/movements` (`CashMovementResource`). */
export interface CashMovementRow {
  id: string;
  cash_register_id: string;
  expense_id: string | null;
  installment_id: string | null;
  type: CashMovementType;
  category: string | null;
  payment_method: CashPaymentMethod;
  amount: number;
  description: string;
  reference: string | null;
  is_automatic: boolean;
  is_voided: boolean;
  void_reason: string | null;
  movement_at: string;
  created_at: string;

  /** Solo si el backend cargó la relación (`whenLoaded`). */
  recorded_by_name?: string;
  expense_description?: string;
  expense_category_name?: string;
}

export interface CashMovementListParams {
  page?: number;
  perPage?: number;
  type?: CashMovementType;
  category?: string;
  paymentMethod?: CashPaymentMethod;
  isVoided?: boolean;
  isAutomatic?: boolean;
}

/** Cuerpo de `POST /cash-movements` (`StoreCashMovementRequest`). */
export interface CreateCashMovementInput {
  type: CashMovementType;
  category: string;
  payment_method: CashPaymentMethod;
  amount: number;
  description: string;
  reference?: string | null;
  movement_at?: string | null;
}

/** Cuerpo de `DELETE /cash-movements/{id}` (`VoidCashMovementRequest`). */
export interface VoidCashMovementInput {
  void_reason: string;
}

/** `GET /cash-register/catalog`. */
export interface CashRegisterCatalog {
  payment_methods: string[];
  income_categories: string[];
  expense_categories: string[];
  physical_cash_methods: string[];
  statuses: string[];
}
