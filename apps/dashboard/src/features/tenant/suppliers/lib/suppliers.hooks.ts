import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { suppliersApi } from "./suppliers.api";
import { supplierKeys } from "./suppliers.keys";
import { CreateSupplierInput, SupplierListParams, SupplierRow, UpdateSupplierInput } from "./suppliers.types";

/** Lista paginada de proveedores, con búsqueda y filtro de estado opcionales. */
export function useSuppliers(params: SupplierListParams = {}) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSupplierInput) => suppliersApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) =>
      suppliersApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

/**
 * Activa/desactiva un proveedor al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleSupplierActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplier: SupplierRow) =>
      suppliersApi.update(supplier.id, { is_active: !supplier.is_active }),
    onMutate: async (supplier: SupplierRow) => {
      await queryClient.cancelQueries({ queryKey: supplierKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<SupplierRow>>({
        queryKey: supplierKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<SupplierRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === supplier.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _supplier, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

const toSupplierOption = (supplier: SupplierRow): ComboboxOption => ({
  value: supplier.id,
  label: supplier.name,
  hint: supplier.ruc ?? undefined,
});

/**
 * Opciones asíncronas de proveedor (buscador por nombre o RUC) para
 * combobox. Pensado para las órdenes de compra y los mantenimientos de
 * equipos, que reutilizan este catálogo.
 */
export function useSupplierOptions(enabled = true) {
  return useAsyncOptions<SupplierRow>({
    queryKey: supplierKeys.options,
    fetchPage: ({ search, page }) => suppliersApi.list({ search, page, perPage: 20 }),
    toOption: toSupplierOption,
    enabled,
  });
}
