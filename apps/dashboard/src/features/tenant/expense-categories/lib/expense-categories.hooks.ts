import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { expenseCategoriesApi } from "./expense-categories.api";
import { expenseCategoryKeys } from "./expense-categories.keys";
import {
  CreateExpenseCategoryInput,
  ExpenseCategoryListParams,
  ExpenseCategoryRow,
  UpdateExpenseCategoryInput,
} from "./expense-categories.types";

/** Lista paginada de categorías de gasto, con búsqueda opcional (`search`). */
export function useExpenseCategories(params: ExpenseCategoryListParams = {}) {
  return useQuery({
    queryKey: expenseCategoryKeys.list(params),
    queryFn: () => expenseCategoriesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) => expenseCategoriesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all }),
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseCategoryInput }) =>
      expenseCategoriesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all }),
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all }),
  });
}

/**
 * Activa/desactiva una categoría al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla.
 */
export function useToggleExpenseCategoryActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: ExpenseCategoryRow) => expenseCategoriesApi.toggleActive(category.id),
    onMutate: async (category: ExpenseCategoryRow) => {
      await queryClient.cancelQueries({ queryKey: expenseCategoryKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<ExpenseCategoryRow>>({
        queryKey: expenseCategoryKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<ExpenseCategoryRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === category.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _category, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all }),
  });
}

const toExpenseCategoryOption = (category: ExpenseCategoryRow): ComboboxOption => ({
  value: category.id,
  label: category.name,
});

/** Opciones asíncronas de categoría (buscador por nombre) para combobox. */
export function useExpenseCategoryOptions(enabled = true) {
  return useAsyncOptions<ExpenseCategoryRow>({
    queryKey: expenseCategoryKeys.options,
    fetchPage: ({ search, page }) =>
      expenseCategoriesApi.list({ search, page, perPage: 20, isActive: true }),
    toOption: toExpenseCategoryOption,
    enabled,
  });
}
