import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { specialtiesApi } from "./specialties.api";
import { specialtyKeys } from "./specialties.keys";
import {
  CreateSpecialtyInput,
  SpecialtyListParams,
  SpecialtyRow,
  UpdateSpecialtyInput,
} from "./specialties.types";

/** Lista paginada de especialidades, con búsqueda opcional (`search`). */
export function useSpecialties(params: SpecialtyListParams = {}) {
  return useQuery({
    queryKey: specialtyKeys.list(params),
    queryFn: () => specialtiesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSpecialtyInput) => specialtiesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialtyKeys.all }),
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSpecialtyInput }) =>
      specialtiesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialtyKeys.all }),
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => specialtiesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialtyKeys.all }),
  });
}

export function useRestoreSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => specialtiesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialtyKeys.all }),
  });
}

/**
 * Activa/desactiva una especialidad al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleSpecialtyActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (specialty: SpecialtyRow) =>
      specialtiesApi.update(specialty.id, { is_active: !specialty.is_active }),
    onMutate: async (specialty: SpecialtyRow) => {
      await queryClient.cancelQueries({ queryKey: specialtyKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<SpecialtyRow>>({
        queryKey: specialtyKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<SpecialtyRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === specialty.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _specialty, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: specialtyKeys.all }),
  });
}

const toSpecialtyOption = (specialty: SpecialtyRow): ComboboxOption => ({
  value: specialty.id,
  label: specialty.name,
});

/** Opciones asíncronas de especialidad (buscador por nombre) para combobox. */
export function useSpecialtyOptions(enabled = true) {
  return useAsyncOptions<SpecialtyRow>({
    queryKey: specialtyKeys.options,
    fetchPage: ({ search, page }) => specialtiesApi.list({ search, page, perPage: 20 }),
    toOption: toSpecialtyOption,
    enabled,
  });
}
