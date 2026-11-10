import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { cashRegisterKeys } from "@/features/tenant/cash-register";
import { classSchedulesApi } from "@/features/tenant/class-schedules/lib/class-schedules.api";
import { classScheduleKeys } from "@/features/tenant/class-schedules/lib/class-schedules.keys";
import { classSessionsApi } from "@/features/tenant/class-sessions/lib/class-sessions.api";
import type { ClassSessionRow } from "@/features/tenant/class-sessions/lib/class-sessions.types";
import { gymClassesApi } from "@/features/tenant/gym-classes/lib/gym-classes.api";
import { gymClassKeys } from "@/features/tenant/gym-classes/lib/gym-classes.keys";
import { instructorsApi } from "@/features/tenant/instructors";
import { instructorKeys } from "@/features/tenant/instructors/lib/instructors.keys";
import { classSessionKeys } from "@/features/tenant/class-sessions/lib/class-sessions.keys";
import { leadKeys } from "@/features/tenant/leads";
import { walkInVisitKeys } from "@/features/tenant/walk-in-visits/lib/walk-in-visits.keys";
import { classEnrollmentsApi } from "./class-enrollments.api";
import { classEnrollmentKeys } from "./class-enrollments.keys";
import type { ClassEnrollmentListParams, EnrollInput } from "./class-enrollments.types";

/** Inscritos y lista de espera de una sesión. */
export function useClassEnrollments(sessionId: number | null, params: ClassEnrollmentListParams = {}) {
  return useQuery({
    queryKey: classEnrollmentKeys.list(sessionId ?? 0, params),
    queryFn: () => classEnrollmentsApi.list(sessionId!, params),
    placeholderData: keepPreviousData,
    enabled: sessionId != null,
  });
}

/**
 * Una inscripción cambia los contadores de la sesión (`enrolled_count`,
 * `waitlist_count`) y, si es clase suelta, también la caja, los leads y el
 * libro de visitas.
 */
function useInvalidateAfterChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: classEnrollmentKeys.all });
    queryClient.invalidateQueries({ queryKey: classSessionKeys.all });
    queryClient.invalidateQueries({ queryKey: walkInVisitKeys.all });
    queryClient.invalidateQueries({ queryKey: leadKeys.all });
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
  };
}

export function useEnroll(sessionId: number) {
  const invalidate = useInvalidateAfterChange();
  return useMutation({
    mutationFn: (input: EnrollInput) => classEnrollmentsApi.enroll(sessionId, input),
    onSuccess: invalidate,
  });
}

export function useMarkAttendance(sessionId: number) {
  const invalidate = useInvalidateAfterChange();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "attended" | "no_show" }) =>
      classEnrollmentsApi.markAttendance(sessionId, id, status),
    onSuccess: invalidate,
  });
}

export function useCancelEnrollment(sessionId: number) {
  const invalidate = useInvalidateAfterChange();
  return useMutation({
    mutationFn: (id: number) => classEnrollmentsApi.cancel(sessionId, id),
    onSuccess: invalidate,
  });
}

/**
 * Detalle de una sesión para su pantalla de inscritos. `GET /class-sessions/{id}`
 * no trae relaciones, así que se resuelven la clase (nombre y precio de clase
 * suelta), el horario y el instructor con sus propios `get`, y se devuelve una
 * `ClassSessionRow` ya armada para reutilizar con `EnrollDialog`.
 */
export function useClassSessionDetail(sessionId: string) {
  const sessionQuery = useQuery({
    queryKey: classSessionKeys.detail(sessionId),
    queryFn: () => classSessionsApi.get(sessionId),
  });
  const base = sessionQuery.data;

  const scheduleQuery = useQuery({
    queryKey: [...classScheduleKeys.all, "detail", base?.class_schedule_id],
    queryFn: () => classSchedulesApi.get(base!.class_schedule_id),
    enabled: base != null,
  });
  const schedule = scheduleQuery.data;

  const gymClassQuery = useQuery({
    queryKey: [...gymClassKeys.all, "detail", schedule?.gym_class_id],
    queryFn: () => gymClassesApi.get(schedule!.gym_class_id),
    enabled: schedule != null,
  });
  const instructorQuery = useQuery({
    queryKey: instructorKeys.detail(String(base?.instructor_id)),
    queryFn: () => instructorsApi.get(base!.instructor_id),
    enabled: base != null,
  });

  const session = useMemo<ClassSessionRow | null>(() => {
    if (!base) return null;
    const gymClass = gymClassQuery.data;
    return {
      ...base,
      class_schedule: {
        id: base.class_schedule_id,
        gym_class: gymClass
          ? { id: gymClass.id, name: gymClass.name, drop_in_price: gymClass.drop_in_price }
          : undefined,
      },
      instructor: instructorQuery.data
        ? { id: instructorQuery.data.id, staff: instructorQuery.data.staff }
        : undefined,
    };
  }, [base, gymClassQuery.data, instructorQuery.data]);

  return {
    session,
    isPending: sessionQuery.isPending,
    isError: sessionQuery.isError,
    refetch: sessionQuery.refetch,
  };
}
