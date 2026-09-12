import { ExpenseListParams, ExpenseSummaryParams } from "./expenses.types";

/** Fábrica de query-keys de React Query para el módulo de gastos. */
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (params: ExpenseListParams) => [...expenseKeys.lists(), params] as const,
  summaries: () => [...expenseKeys.all, "summary"] as const,
  summary: (params: ExpenseSummaryParams) => [...expenseKeys.summaries(), params] as const,
};
