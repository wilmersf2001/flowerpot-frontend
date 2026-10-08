import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  ATTENDANCE_ENDPOINT,
  ATTENDANCE_PER_PAGE,
} from "./attendance.constants";
import {
  AttendanceListParams,
  AttendanceRow,
  CreateAttendanceInput,
} from "./attendance.types";

async function list(
  params: AttendanceListParams = {},
): Promise<Paginated<AttendanceRow>> {
  const { data } = await apiClient.get<unknown>(ATTENDANCE_ENDPOINT, {
    params: buildListParams(params, ATTENDANCE_PER_PAGE),
  });
  return unwrapPaginated<AttendanceRow>(data);
}

async function create(input: CreateAttendanceInput): Promise<AttendanceRow> {
  const { data } = await apiClient.post<unknown>(ATTENDANCE_ENDPOINT, input);
  return unwrapEnvelope<AttendanceRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${ATTENDANCE_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const attendanceApi = { list, create, remove };
