import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { productsApi } from "./products.api";
import { productKeys } from "./products.keys";
import { CreateProductInput, ProductListParams, ProductRow, UpdateProductInput } from "./products.types";

/** Lista paginada de productos, con búsqueda y filtros (categoría, estado) opcionales. */
export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

/**
 * Activa/desactiva un producto al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: ProductRow) =>
      productsApi.update(product.id, { is_active: !product.is_active }),
    onMutate: async (product: ProductRow) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<ProductRow>>({
        queryKey: productKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<ProductRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === product.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _product, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

const toProductOption = (product: ProductRow): ComboboxOption => ({
  value: product.id,
  label: product.name,
  hint: product.sku,
});

/** Opciones asíncronas de producto (buscador por nombre o SKU) para combobox. */
export function useProductOptions(enabled = true) {
  return useAsyncOptions<ProductRow>({
    queryKey: productKeys.options,
    fetchPage: ({ search, page }) => productsApi.list({ search, page, perPage: 20 }),
    toOption: toProductOption,
    enabled,
  });
}
