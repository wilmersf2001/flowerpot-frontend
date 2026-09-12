import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { attendanceApi } from "./attendance.api";
import { attendanceKeys } from "./attendance.keys";
import { AttendanceListParams, CreateAttendanceInput } from "./attendance.types";

export { useMemberOptions } from "@/features/tenant/members";

/**
 * Lista paginada de asistencias, con búsqueda opcional (`search`), filtrada
 * por la sede activa del switcher global — la página no la pasa, se toma sola.
 *
 * Deshabilitada mientras `selectedBranchId` es `null` (branches del usuario
 * todavía cargando): así se evita mandar el listado sin filtro de sede y que
 * el usuario vea, aunque sea un instante, asistencias de otra sede.
 */
export function useAttendances(params: AttendanceListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: AttendanceListParams = { ...params, branchId: selectedBranchId };
  return useQuery({
    queryKey: attendanceKeys.list(listParams),
    queryFn: () => attendanceApi.list(listParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

/** Registro manual de asistencia (check-in) en la sede activa del switcher global. */
export function useCreateAttendance() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: Omit<CreateAttendanceInput, "branch_id">) =>
      attendanceApi.create({ ...input, branch_id: Number(selectedBranchId) }),
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
