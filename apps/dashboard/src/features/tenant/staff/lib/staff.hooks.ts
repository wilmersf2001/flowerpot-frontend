import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import { staffApi } from "./staff.api";
import { staffKeys } from "./staff.keys";
import { CreateStaffInput, StaffListParams, StaffRow, UpdateStaffInput } from "./staff.types";

export { useJobPositionOptions } from "@/features/tenant/job-positions";
export { useBranchOptions } from "@/features/tenant/branches";

/** Lista paginada de personal, con búsqueda opcional (`search`). */
export function useStaff(params: StaffListParams = {}) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => staffApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      staffApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

export function useRestoreStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}

/**
 * Activa/desactiva a un miembro del personal al vuelo (el `Switch` de la
 * tabla), con actualización optimista: la fila cambia de estado en el acto y
 * se revierte si el backend falla. No hay endpoint dedicado; se usa el
 * `update` general enviando solo `is_active`.
 */
export function useToggleStaffActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staff: StaffRow) => staffApi.update(staff.id, { is_active: !staff.is_active }),
    onMutate: async (staff: StaffRow) => {
      await queryClient.cancelQueries({ queryKey: staffKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<StaffRow>>({
        queryKey: staffKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<StaffRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === staff.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _staff, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
}
