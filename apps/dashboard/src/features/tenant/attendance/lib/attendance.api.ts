import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { ATTENDANCE_ENDPOINT, ATTENDANCE_PER_PAGE } from "./attendance.constants";
import { AttendanceListParams, AttendanceRow, CreateAttendanceInput } from "./attendance.types";

/** Mapea la fila cruda del backend, incluidas sus relaciones opcionales (`whenLoaded`). */
function toAttendanceRow(raw: Record<string, unknown>): AttendanceRow {
  const member = raw.member as Record<string, unknown> | undefined;
  const branch = raw.branch as Record<string, unknown> | undefined;
  const device = raw.device as Record<string, unknown> | null | undefined;
  const membership = raw.membership as Record<string, unknown> | null | undefined;
  return {
    id: String(raw.id),
    member_id: String(raw.member_id),
    membership_id: raw.membership_id == null ? null : String(raw.membership_id),
    checked_in_at: String(raw.checked_in_at ?? ""),
    source: String(raw.source ?? ""),
    notes: String(raw.notes ?? ""),
    created_at: String(raw.created_at ?? ""),
    member_name: member ? String(member.full_name ?? "") : undefined,
    member_dni: member ? String(member.dni ?? "") : undefined,
    branch_name: branch ? String(branch.name ?? "") : undefined,
    device_name: device ? String(device.name ?? "") : undefined,
    membership_ends_at: membership ? String(membership.ends_at ?? "") : undefined,
  };
}

async function list(params: AttendanceListParams = {}): Promise<Paginated<AttendanceRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(ATTENDANCE_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? ATTENDANCE_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toAttendanceRow) };
}

async function create(input: CreateAttendanceInput): Promise<AttendanceRow> {
  const { data } = await apiClient.post<unknown>(ATTENDANCE_ENDPOINT, input);
  return toAttendanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${ATTENDANCE_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const attendanceApi = { list, create, remove };
