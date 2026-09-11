import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "./attendance.api";
import { attendanceKeys } from "./attendance.keys";
import { AttendanceListParams, CreateAttendanceInput } from "./attendance.types";

export { useMemberOptions } from "@/features/tenant/members";
export { useBranchOptions } from "@/features/tenant/branches";

/** Lista paginada de asistencias, con búsqueda opcional (`search`). */
export function useAttendances(params: AttendanceListParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Registro manual de asistencia (check-in). */
export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAttendanceInput) => attendanceApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
