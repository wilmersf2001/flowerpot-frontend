import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { jobPositionsApi } from "./job-positions.api";
import { jobPositionKeys } from "./job-positions.keys";
import {
  CreateJobPositionInput,
  JobPositionListParams,
  JobPositionRow,
  UpdateJobPositionInput,
} from "./job-positions.types";

/** Lista paginada de cargos, con búsqueda opcional (`search`). */
export function useJobPositions(params: JobPositionListParams = {}) {
  return useQuery({
    queryKey: jobPositionKeys.list(params),
    queryFn: () => jobPositionsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobPositionInput) => jobPositionsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobPositionKeys.all }),
  });
}

export function useUpdateJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJobPositionInput }) =>
      jobPositionsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobPositionKeys.all }),
  });
}

export function useDeleteJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobPositionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobPositionKeys.all }),
  });
}

export function useRestoreJobPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobPositionsApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobPositionKeys.all }),
  });
}

/**
 * Activa/desactiva un cargo al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleJobPositionActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobPosition: JobPositionRow) =>
      jobPositionsApi.update(jobPosition.id, { is_active: !jobPosition.is_active }),
    onMutate: async (jobPosition: JobPositionRow) => {
      await queryClient.cancelQueries({ queryKey: jobPositionKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<JobPositionRow>>({
        queryKey: jobPositionKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<JobPositionRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === jobPosition.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _jobPosition, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: jobPositionKeys.all }),
  });
}

const toJobPositionOption = (jobPosition: JobPositionRow): ComboboxOption => ({
  value: jobPosition.id,
  label: jobPosition.name,
});

/** Opciones asíncronas de cargo (buscador por nombre) para combobox. */
export function useJobPositionOptions(enabled = true) {
  return useAsyncOptions<JobPositionRow>({
    queryKey: jobPositionKeys.options,
    fetchPage: ({ search, page }) => jobPositionsApi.list({ search, page, perPage: 20 }),
    toOption: toJobPositionOption,
    enabled,
  });
}
