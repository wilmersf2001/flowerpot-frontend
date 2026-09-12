import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { expensesApi } from "./expenses.api";
import { expenseKeys } from "./expenses.keys";
import {
  CreateExpenseInput,
  ExpenseListParams,
  ExpenseSummaryParams,
  ReviewExpenseInput,
  UpdateExpenseInput,
  VoidExpenseInput,
} from "./expenses.types";

export { useExpenseCategoryOptions } from "@/features/tenant/expense-categories";

/**
 * La caja diaria se descuenta automáticamente al aprobar/anular un gasto en
 * efectivo (ver docs del backend). Como `expenses` y `cash-register` son
 * módulos independientes, se invalida por la key cruda en vez de importar el
 * módulo de caja (evita acoplarlos).
 */
const CASH_REGISTER_KEY = ["cash-register"] as const;

/**
 * Lista paginada de gastos, con filtros opcionales, acotada a la sede activa
 * del switcher global — la página no la pasa, se toma sola.
 */
export function useExpenses(params: ExpenseListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: ExpenseListParams = { ...params, branchId: selectedBranchId };
  return useQuery({
    queryKey: expenseKeys.list(listParams),
    queryFn: () => expensesApi.list(listParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

/** Resumen de gastos (totales por estado, categoría y método de pago). */
export function useExpenseSummary(params: ExpenseSummaryParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const summaryParams: ExpenseSummaryParams = { ...params, branchId: selectedBranchId };
  return useQuery({
    queryKey: expenseKeys.summary(summaryParams),
    queryFn: () => expensesApi.summary(summaryParams),
    enabled: selectedBranchId != null,
  });
}

/** Crea un gasto en la sede activa del switcher global. Siempre nace `pending`. */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      expensesApi.create({
        ...input,
        branch_id: selectedBranchId ? Number(selectedBranchId) : null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

/** Solo gastos `pending` se pueden editar (lo valida el backend). */
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      expensesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useRestoreExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

/**
 * Aprueba o rechaza un gasto pendiente. Si se aprueba uno en efectivo, el
 * backend crea un movimiento automático en la caja abierta de la sede —
 * también se invalida `cash-register` para reflejar el nuevo balance.
 */
export function useReviewExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewExpenseInput }) =>
      expensesApi.review(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY });
    },
  });
}

/**
 * Anula un gasto `pending` o `approved`. Si tenía un movimiento de caja
 * automático, el backend lo revierte — se invalida `cash-register` también.
 */
export function useVoidExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VoidExpenseInput }) =>
      expensesApi.void(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY });
    },
  });
}
