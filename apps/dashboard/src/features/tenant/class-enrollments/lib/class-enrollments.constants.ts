/** Ruta anidada de inscripciones de una sesión (el `apiClient` le antepone `/api/proxy`). */
export const classEnrollmentsEndpoint = (sessionId: string | number) =>
  `/class-sessions/${encodeURIComponent(sessionId)}/enrollments`;

export const CLASS_ENROLLMENTS_PER_PAGE = 10;

export const CLASS_VIEW_ATTENDANCE_PERMISSION = "classes.view_attendance";
export const CLASS_ENROLL_PERMISSION = "classes.enroll";
export const CLASS_MANAGE_ATTENDANCE_PERMISSION = "classes.manage_attendance";

export const ENROLLMENT_STATUSES = [
  "enrolled",
  "waitlisted",
  "cancelled",
  "attended",
  "no_show",
] as const;

export const ENROLLMENT_STATUS_LABELS: Record<(typeof ENROLLMENT_STATUSES)[number], string> = {
  enrolled: "Inscrito",
  waitlisted: "En espera",
  cancelled: "Cancelada",
  attended: "Asistió",
  no_show: "Faltó",
};

/** Métodos que acepta el cobro de una clase suelta. */
export const ENROLLMENT_PAYMENT_METHODS = ["cash", "yape", "plin", "transfer", "pos"] as const;
