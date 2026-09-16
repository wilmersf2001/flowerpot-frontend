import { InstructorScheduleListParams } from "./instructor-schedules.types";

/** Fábrica de query-keys de React Query para el módulo de horarios de instructor. */
export const instructorScheduleKeys = {
  all: ["instructor-schedules"] as const,
  lists: () => [...instructorScheduleKeys.all, "list"] as const,
  list: (params: InstructorScheduleListParams) =>
    [...instructorScheduleKeys.lists(), params] as const,
};
