import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instructorSchedulesApi } from "./instructor-schedules.api";
import { instructorScheduleKeys } from "./instructor-schedules.keys";
import {
  CreateInstructorScheduleInput,
  InstructorScheduleListParams,
  UpdateInstructorScheduleInput,
} from "./instructor-schedules.types";

/** Horarios de disponibilidad de un instructor (siempre acotado a `instructorId`). */
export function useInstructorSchedules(params: InstructorScheduleListParams) {
  return useQuery({
    queryKey: instructorScheduleKeys.list(params),
    queryFn: () => instructorSchedulesApi.list(params),
    enabled: Boolean(params.instructorId),
    placeholderData: keepPreviousData,
  });
}

export function useCreateInstructorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInstructorScheduleInput) => instructorSchedulesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all }),
  });
}

export function useUpdateInstructorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInstructorScheduleInput }) =>
      instructorSchedulesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all }),
  });
}

export function useDeleteInstructorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instructorSchedulesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all }),
  });
}

export function useRestoreInstructorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instructorSchedulesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all }),
  });
}
