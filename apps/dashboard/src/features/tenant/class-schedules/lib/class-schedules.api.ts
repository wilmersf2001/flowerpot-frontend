import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { toBoolean } from "@/features/_shared/format";
import {
  CLASS_SCHEDULES_ENDPOINT,
  CLASS_SCHEDULES_PER_PAGE,
} from "./class-schedules.constants";
import {
  ClassScheduleBranch,
  ClassScheduleGymClass,
  ClassScheduleInstructor,
  ClassScheduleListParams,
  ClassScheduleRow,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
} from "./class-schedules.types";

function toClassScheduleGymClass(raw: unknown): ClassScheduleGymClass | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  return {
    id: Number(c.id),
    name: String(c.name ?? ""),
    duration_minutes: Number(c.duration_minutes ?? 0),
    max_capacity: Number(c.max_capacity ?? 0),
  };
}

function toClassScheduleInstructor(raw: unknown): ClassScheduleInstructor | null {
  if (!raw || typeof raw !== "object") return null;
  const i = raw as Record<string, unknown>;
  const staff = i.staff as Record<string, unknown> | undefined;
  return {
    id: Number(i.id),
    staff: staff ? { full_name: String(staff.full_name ?? ""), dni: String(staff.dni ?? "") } : null,
  };
}

function toClassScheduleBranch(raw: unknown): ClassScheduleBranch | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  return { id: Number(b.id), name: String(b.name ?? "") };
}

function toClassScheduleRow(raw: Record<string, unknown>): ClassScheduleRow {
  return {
    id: Number(raw.id),
    gym_class_id: Number(raw.gym_class_id ?? 0),
    gym_class: toClassScheduleGymClass(raw.gym_class),
    instructor_id: Number(raw.instructor_id ?? 0),
    instructor: toClassScheduleInstructor(raw.instructor),
    branch_id: Number(raw.branch_id ?? 0),
    branch: toClassScheduleBranch(raw.branch),
    day_of_week: Number(raw.day_of_week),
    day_label: String(raw.day_label ?? ""),
    start_time: String(raw.start_time ?? ""),
    end_time: String(raw.end_time ?? ""),
    max_capacity: raw.max_capacity == null ? null : Number(raw.max_capacity),
    effective_capacity: raw.effective_capacity == null ? null : Number(raw.effective_capacity),
    is_active: toBoolean(raw.is_active),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: ClassScheduleListParams = {}): Promise<Paginated<ClassScheduleRow>> {
  const { data } = await apiClient.get<unknown>(CLASS_SCHEDULES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? CLASS_SCHEDULES_PER_PAGE,
      branch_id: params.branchId || undefined,
      instructor_id: params.instructorId || undefined,
      gym_class_id: params.gymClassId || undefined,
      day_of_week: params.dayOfWeek || undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toClassScheduleRow) };
}

async function create(input: CreateClassScheduleInput): Promise<ClassScheduleRow> {
  const { data } = await apiClient.post<unknown>(CLASS_SCHEDULES_ENDPOINT, input);
  return toClassScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: number, input: UpdateClassScheduleInput): Promise<ClassScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toClassScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un horario eliminado (soft-delete). */
async function restore(id: number): Promise<ClassScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toClassScheduleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const classSchedulesApi = { list, create, update, remove, restore };
