import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { enumFallback } from "@/features/_shared/form-schema";
import { CLASS_SESSIONS_ENDPOINT, CLASS_SESSIONS_PER_PAGE, CLASS_SESSION_STATUSES } from "./class-sessions.constants";
import {
  ClassSessionBranch,
  ClassSessionClassSchedule,
  ClassSessionGymClass,
  ClassSessionInstructor,
  ClassSessionListParams,
  ClassSessionRow,
  UpdateClassSessionInput,
} from "./class-sessions.types";

const normalizeStatus = enumFallback(CLASS_SESSION_STATUSES, "scheduled");

function toClassSessionGymClass(raw: unknown): ClassSessionGymClass | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  return { id: String(c.id), name: String(c.name ?? "") };
}

function toClassSessionBranch(raw: unknown): ClassSessionBranch | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  return { id: String(b.id), name: String(b.name ?? "") };
}

function toClassSessionClassSchedule(raw: unknown): ClassSessionClassSchedule | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  return {
    id: String(s.id),
    gym_class: toClassSessionGymClass(s.gym_class),
    branch: toClassSessionBranch(s.branch),
  };
}

function toClassSessionInstructor(raw: unknown): ClassSessionInstructor | null {
  if (!raw || typeof raw !== "object") return null;
  const i = raw as Record<string, unknown>;
  const staff = i.staff as Record<string, unknown> | undefined;
  return {
    id: String(i.id),
    staff: staff ? { full_name: String(staff.full_name ?? ""), dni: String(staff.dni ?? "") } : null,
  };
}

function toClassSessionRow(raw: Record<string, unknown>): ClassSessionRow {
  return {
    id: String(raw.id),
    class_schedule_id: String(raw.class_schedule_id ?? ""),
    class_schedule: toClassSessionClassSchedule(raw.class_schedule),
    session_date: String(raw.session_date ?? ""),
    start_time: String(raw.start_time ?? ""),
    end_time: String(raw.end_time ?? ""),
    instructor_id: String(raw.instructor_id ?? ""),
    instructor: toClassSessionInstructor(raw.instructor),
    max_capacity: Number(raw.max_capacity ?? 0),
    status: normalizeStatus(String(raw.status ?? "")),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: ClassSessionListParams = {}): Promise<Paginated<ClassSessionRow>> {
  const { data } = await apiClient.get<unknown>(CLASS_SESSIONS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? CLASS_SESSIONS_PER_PAGE,
      class_schedule_id: params.classScheduleId || undefined,
      instructor_id: params.instructorId || undefined,
      status: params.status || undefined,
      session_date_start: params.sessionDateStart || undefined,
      session_date_end: params.sessionDateEnd || undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toClassSessionRow) };
}

async function update(id: string, input: UpdateClassSessionInput): Promise<ClassSessionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SESSIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toClassSessionRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const classSessionsApi = { list, update };
