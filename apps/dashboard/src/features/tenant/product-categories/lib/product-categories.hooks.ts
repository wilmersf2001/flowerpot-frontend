import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { productCategoriesApi } from "./product-categories.api";
import { productCategoryKeys } from "./product-categories.keys";
import {
  CreateProductCategoryInput,
  ProductCategoryListParams,
  ProductCategoryRow,
  UpdateProductCategoryInput,
} from "./product-categories.types";

/** Lista paginada de categorías, con búsqueda y filtro de estado opcionales. */
export function useProductCategories(params: ProductCategoryListParams = {}) {
  return useQuery({
    queryKey: productCategoryKeys.list(params),
    queryFn: () => productCategoriesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductCategoryInput) => productCategoriesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productCategoryKeys.all }),
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductCategoryInput }) =>
      productCategoriesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productCategoryKeys.all }),
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productCategoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productCategoryKeys.all }),
  });
}

export function useRestoreProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productCategoriesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productCategoryKeys.all }),
  });
}

/**
 * Activa/desactiva una categoría al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleProductCategoryActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: ProductCategoryRow) =>
      productCategoriesApi.update(category.id, { is_active: !category.is_active }),
    onMutate: async (category: ProductCategoryRow) => {
      await queryClient.cancelQueries({ queryKey: productCategoryKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<ProductCategoryRow>>({
        queryKey: productCategoryKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<ProductCategoryRow>>(key, {
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: productCategoryKeys.all }),
  });
}

const toProductCategoryOption = (category: ProductCategoryRow): ComboboxOption => ({
  value: category.id,
  label: category.name,
});

/** Opciones asíncronas de categoría (buscador por nombre) para combobox. */
export function useProductCategoryOptions(enabled = true) {
  return useAsyncOptions<ProductCategoryRow>({
    queryKey: productCategoryKeys.options,
    fetchPage: ({ search, page }) => productCategoriesApi.list({ search, page, perPage: 20 }),
    toOption: toProductCategoryOption,
    enabled,
  });
}
