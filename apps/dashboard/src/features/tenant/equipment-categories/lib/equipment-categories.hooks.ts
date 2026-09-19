import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { equipmentCategoriesApi } from "./equipment-categories.api";
import { equipmentCategoryKeys } from "./equipment-categories.keys";
import {
  CreateEquipmentCategoryInput,
  EquipmentCategoryListParams,
  EquipmentCategoryRow,
  UpdateEquipmentCategoryInput,
} from "./equipment-categories.types";

/** Lista paginada de categorías, con búsqueda y filtro de estado opcionales. */
export function useEquipmentCategories(params: EquipmentCategoryListParams = {}) {
  return useQuery({
    queryKey: equipmentCategoryKeys.list(params),
    queryFn: () => equipmentCategoriesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEquipmentCategoryInput) => equipmentCategoriesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentCategoryKeys.all }),
  });
}

export function useUpdateEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentCategoryInput }) =>
      equipmentCategoriesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentCategoryKeys.all }),
  });
}

export function useDeleteEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentCategoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentCategoryKeys.all }),
  });
}

export function useRestoreEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentCategoriesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentCategoryKeys.all }),
  });
}

/**
 * Activa/desactiva una categoría al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleEquipmentCategoryActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: EquipmentCategoryRow) =>
      equipmentCategoriesApi.update(category.id, { is_active: !category.is_active }),
    onMutate: async (category: EquipmentCategoryRow) => {
      await queryClient.cancelQueries({ queryKey: equipmentCategoryKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<EquipmentCategoryRow>>({
        queryKey: equipmentCategoryKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<EquipmentCategoryRow>>(key, {
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: equipmentCategoryKeys.all }),
  });
}

const toEquipmentCategoryOption = (category: EquipmentCategoryRow): ComboboxOption => ({
  value: category.id,
  label: category.name,
});

/** Opciones asíncronas de categoría (buscador por nombre) para combobox. */
export function useEquipmentCategoryOptions(enabled = true) {
  return useAsyncOptions<EquipmentCategoryRow>({
    queryKey: equipmentCategoryKeys.options,
    fetchPage: ({ search, page }) => equipmentCategoriesApi.list({ search, page, perPage: 20 }),
    toOption: toEquipmentCategoryOption,
    enabled,
  });
}
