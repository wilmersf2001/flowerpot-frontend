import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  WALK_IN_VISITS_ENDPOINT,
  WALK_IN_VISITS_PER_PAGE,
  WALK_IN_VISITS_REPORT_ENDPOINT,
  branchDayPassEndpoint,
} from "./walk-in-visits.constants";
import type {
  DayPassInput,
  VisitorsReport,
  VisitorsReportParams,
  WalkInVisitListParams,
  WalkInVisitRow,
} from "./walk-in-visits.types";

async function list(params: WalkInVisitListParams = {}): Promise<Paginated<WalkInVisitRow>> {
  const { data } = await apiClient.get<unknown>(WALK_IN_VISITS_ENDPOINT, {
    params: buildListParams(params, WALK_IN_VISITS_PER_PAGE),
  });
  return unwrapPaginated<WalkInVisitRow>(data);
}

async function report(params: VisitorsReportParams = {}): Promise<VisitorsReport> {
  const { data } = await apiClient.get<unknown>(WALK_IN_VISITS_REPORT_ENDPOINT, {
    params: buildListParams(params, WALK_IN_VISITS_PER_PAGE),
  });
  const body = unwrapEnvelope<VisitorsReport>(data);
  return { ...body, people: { ...body.people, ...unwrapPaginated(body.people) } };
}

async function chargeDayPass(branchId: string | number, input: DayPassInput): Promise<WalkInVisitRow> {
  const { data } = await apiClient.post<unknown>(branchDayPassEndpoint(branchId), input);
  return unwrapEnvelope<WalkInVisitRow>(data);
}

/** Devuelve un pase de día (la clase suelta se devuelve cancelando su inscripción). */
async function refund(id: number, reason: string): Promise<void> {
  await apiClient.delete(`${WALK_IN_VISITS_ENDPOINT}/${encodeURIComponent(id)}`, { data: { reason } });
}

export const walkInVisitsApi = { list, report, chargeDayPass, refund };
