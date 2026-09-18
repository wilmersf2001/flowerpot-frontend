import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import { classSchedulesApi } from "./class-schedules.api";
import { classScheduleKeys } from "./class-schedules.keys";
import {
  ClassScheduleListParams,
  ClassScheduleRow,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
} from "./class-schedules.types";

/** Lista paginada de horarios recurrentes, con filtros opcionales. */
export function useClassSchedules(params: ClassScheduleListParams = {}) {
  return useQuery({
    queryKey: classScheduleKeys.list(params),
    queryFn: () => classSchedulesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateClassSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassScheduleInput) => classSchedulesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classScheduleKeys.all }),
  });
}

export function useUpdateClassSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClassScheduleInput }) =>
      classSchedulesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classScheduleKeys.all }),
  });
}

export function useDeleteClassSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classSchedulesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classScheduleKeys.all }),
  });
}

export function useRestoreClassSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classSchedulesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classScheduleKeys.all }),
  });
}

/**
 * Activa/desactiva un horario al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleClassScheduleActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedule: ClassScheduleRow) =>
      classSchedulesApi.update(schedule.id, { is_active: !schedule.is_active }),
    onMutate: async (schedule: ClassScheduleRow) => {
      await queryClient.cancelQueries({ queryKey: classScheduleKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<ClassScheduleRow>>({
        queryKey: classScheduleKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<ClassScheduleRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === schedule.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _schedule, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: classScheduleKeys.all }),
  });
}
