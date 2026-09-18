import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { gymClassesApi } from "./gym-classes.api";
import { gymClassKeys } from "./gym-classes.keys";
import { CreateGymClassInput, GymClassListParams, GymClassRow, UpdateGymClassInput } from "./gym-classes.types";

/** Lista paginada de clases (incluye eliminadas), con búsqueda opcional (`search`). */
export function useGymClasses(params: GymClassListParams = {}) {
  return useQuery({
    queryKey: gymClassKeys.list(params),
    queryFn: () => gymClassesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateGymClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGymClassInput) => gymClassesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymClassKeys.all }),
  });
}

export function useUpdateGymClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGymClassInput }) =>
      gymClassesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymClassKeys.all }),
  });
}

export function useDeleteGymClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gymClassesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymClassKeys.all }),
  });
}

export function useRestoreGymClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gymClassesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gymClassKeys.all }),
  });
}

/**
 * Activa/desactiva una clase al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleGymClassActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gymClass: GymClassRow) =>
      gymClassesApi.update(gymClass.id, { is_active: !gymClass.is_active }),
    onMutate: async (gymClass: GymClassRow) => {
      await queryClient.cancelQueries({ queryKey: gymClassKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<GymClassRow>>({
        queryKey: gymClassKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<GymClassRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === gymClass.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _gymClass, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: gymClassKeys.all }),
  });
}

const toGymClassOption = (gymClass: GymClassRow): ComboboxOption => ({
  value: gymClass.id,
  label: gymClass.name,
  hint: `${gymClass.duration_minutes} min`,
});

/** Opciones asíncronas de clase (buscador por nombre) para combobox. */
export function useGymClassOptions(enabled = true) {
  return useAsyncOptions<GymClassRow>({
    queryKey: gymClassKeys.options,
    fetchPage: ({ search, page }) => gymClassesApi.list({ search, page, perPage: 20 }),
    toOption: toGymClassOption,
    enabled,
  });
}
