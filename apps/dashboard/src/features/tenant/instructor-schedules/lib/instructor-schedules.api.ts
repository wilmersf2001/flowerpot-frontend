import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  INSTRUCTOR_SCHEDULES_ENDPOINT,
  INSTRUCTOR_SCHEDULES_PER_PAGE,
} from "./instructor-schedules.constants";
import {
  CreateInstructorScheduleInput,
  InstructorScheduleBranch,
  InstructorScheduleListParams,
  InstructorScheduleRow,
  UpdateInstructorScheduleInput,
} from "./instructor-schedules.types";

function toInstructorScheduleBranch(raw: unknown): InstructorScheduleBranch | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  return { id: String(b.id), name: String(b.name ?? "") };
}

function toInstructorScheduleRow(raw: Record<string, unknown>): InstructorScheduleRow {
  return {
    id: String(raw.id),
    instructor_id: String(raw.instructor_id ?? ""),
    branch_id: String(raw.branch_id ?? ""),
    branch: toInstructorScheduleBranch(raw.branch),
    day_of_week: Number(raw.day_of_week),
    start_time: String(raw.start_time ?? ""),
    end_time: String(raw.end_time ?? ""),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(
  params: InstructorScheduleListParams,
): Promise<Paginated<InstructorScheduleRow>> {
  const { data } = await apiClient.get<unknown>(INSTRUCTOR_SCHEDULES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? INSTRUCTOR_SCHEDULES_PER_PAGE,
      instructor_id: params.instructorId,
      branch_id: params.branchId,
      day_of_week: params.dayOfWeek,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toInstructorScheduleRow) };
}

async function create(input: CreateInstructorScheduleInput): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.post<unknown>(INSTRUCTOR_SCHEDULES_ENDPOINT, input);
  return toInstructorScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateInstructorScheduleInput,
): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toInstructorScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un horario eliminado (soft-delete). */
async function restore(id: string): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toInstructorScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const instructorSchedulesApi = { list, create, update, remove, restore };
