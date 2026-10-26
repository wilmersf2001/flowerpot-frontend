import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { CLASS_ENROLLMENTS_PER_PAGE, classEnrollmentsEndpoint } from "./class-enrollments.constants";
import type {
  CancelEnrollmentResult,
  ClassEnrollmentListParams,
  ClassEnrollmentRow,
  EnrollInput,
} from "./class-enrollments.types";

async function list(
  sessionId: number,
  params: ClassEnrollmentListParams = {},
): Promise<Paginated<ClassEnrollmentRow>> {
  const { data } = await apiClient.get<unknown>(classEnrollmentsEndpoint(sessionId), {
    params: buildListParams(params, CLASS_ENROLLMENTS_PER_PAGE),
  });
  return unwrapPaginated<ClassEnrollmentRow>(data);
}

/** Inscribe (o deja en espera) a una persona; la clase suelta se cobra en el acto. */
async function enroll(sessionId: number, input: EnrollInput): Promise<ClassEnrollmentRow> {
  const { data } = await apiClient.post<unknown>(classEnrollmentsEndpoint(sessionId), input);
  return unwrapEnvelope<ClassEnrollmentRow>(data);
}

async function markAttendance(
  sessionId: number,
  enrollmentId: number,
  status: "attended" | "no_show",
): Promise<ClassEnrollmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${classEnrollmentsEndpoint(sessionId)}/${encodeURIComponent(enrollmentId)}`,
    { status },
  );
  return unwrapEnvelope<ClassEnrollmentRow>(data);
}

/** No borra la fila: la marca `cancelled` y promueve a la lista de espera. */
async function cancel(sessionId: number, enrollmentId: number): Promise<CancelEnrollmentResult> {
  const { data } = await apiClient.delete<unknown>(
    `${classEnrollmentsEndpoint(sessionId)}/${encodeURIComponent(enrollmentId)}`,
  );
  const body = unwrapEnvelope<Partial<CancelEnrollmentResult>>(data);
  return {
    enrollment: body.enrollment as ClassEnrollmentRow,
    promoted: Array.isArray(body.promoted) ? body.promoted : [],
  };
}

export const classEnrollmentsApi = { list, enroll, markAttendance, cancel };
