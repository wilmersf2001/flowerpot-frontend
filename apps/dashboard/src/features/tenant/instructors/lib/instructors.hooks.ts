import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import { instructorsApi } from "./instructors.api";
import { instructorKeys } from "./instructors.keys";
import { CreateInstructorInput, InstructorListParams, InstructorRow, UpdateInstructorInput } from "./instructors.types";

export { useStaffOptions } from "@/features/tenant/staff";
export { useSpecialtyOptions } from "@/features/tenant/specialties";

/** Lista paginada de instructores (incluye eliminados), con búsqueda opcional (`search`). */
export function useInstructors(params: InstructorListParams = {}) {
  return useQuery({
    queryKey: instructorKeys.list(params),
    queryFn: () => instructorsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInstructorInput) => instructorsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInstructorInput }) =>
      instructorsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instructorsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}

export function useRestoreInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instructorsApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}

/**
 * Activa/desactiva un instructor al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleInstructorActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instructor: InstructorRow) =>
      instructorsApi.update(instructor.id, { is_active: !instructor.is_active }),
    onMutate: async (instructor: InstructorRow) => {
      await queryClient.cancelQueries({ queryKey: instructorKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<InstructorRow>>({
        queryKey: instructorKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<InstructorRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === instructor.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _instructor, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: instructorKeys.all }),
  });
}
