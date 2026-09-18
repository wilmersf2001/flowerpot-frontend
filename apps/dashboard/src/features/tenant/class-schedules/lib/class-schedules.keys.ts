import { ClassScheduleListParams } from "./class-schedules.types";

/** Fábrica de query-keys de React Query para el módulo de horarios de clase. */
export const classScheduleKeys = {
  all: ["class-schedules"] as const,
  lists: () => [...classScheduleKeys.all, "list"] as const,
  list: (params: ClassScheduleListParams) => [...classScheduleKeys.lists(), params] as const,
};
