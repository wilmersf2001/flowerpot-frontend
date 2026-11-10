import { AttendanceListParams } from "./attendance.types";

/** Fábrica de query-keys de React Query para el módulo de asistencias. */
export const attendanceKeys = {
  all: ["attendances"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (params: AttendanceListParams) => [...attendanceKeys.lists(), params] as const,
  calendar: (month: string, branchId: string | null) =>
    [...attendanceKeys.all, "calendar", month, branchId] as const,
};
