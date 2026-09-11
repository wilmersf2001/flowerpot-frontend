import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { branchesApi } from "./branches.api";
import { branchKeys } from "./branches.keys";
import { BranchListParams, BranchRow, CreateBranchInput, UpdateBranchInput } from "./branches.types";

/** Lista paginada de sedes, con búsqueda opcional (`search`). */
export function useBranches(params: BranchListParams = {}) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => branchesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBranchInput) => branchesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) =>
      branchesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

export function useRestoreBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

/**
 * Activa/desactiva una sede al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla (p. ej. al intentar desactivar la única sede activa).
 */
export function useToggleBranchActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.toggleActive(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: branchKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<BranchRow>>({
        queryKey: branchKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<BranchRow>>(key, {
          ...page,
          data: page.data.map((branch) =>
            branch.id === id ? { ...branch, is_active: !branch.is_active } : branch,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

const toBranchOption = (branch: BranchRow): ComboboxOption => ({
  value: branch.id,
  label: branch.name,
});

/** Opciones asíncronas de sede (buscador por nombre) para combobox. */
export function useBranchOptions(enabled = true) {
  return useAsyncOptions<BranchRow>({
    queryKey: branchKeys.options,
    fetchPage: ({ search, page }) => branchesApi.list({ search, page, perPage: 20 }),
    toOption: toBranchOption,
    enabled,
  });
}
