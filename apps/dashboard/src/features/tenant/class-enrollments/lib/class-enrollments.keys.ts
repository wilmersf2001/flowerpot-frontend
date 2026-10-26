import type { ClassEnrollmentListParams } from "./class-enrollments.types";

/** Fábrica de query-keys de React Query para inscripciones a clases. */
export const classEnrollmentKeys = {
  all: ["class-enrollments"] as const,
  lists: () => [...classEnrollmentKeys.all, "list"] as const,
  list: (sessionId: number, params: ClassEnrollmentListParams) =>
    [...classEnrollmentKeys.lists(), sessionId, params] as const,
};
