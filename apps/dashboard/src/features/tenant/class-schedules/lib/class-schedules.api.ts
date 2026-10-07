import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  CLASS_SCHEDULES_ENDPOINT,
  CLASS_SCHEDULES_PER_PAGE,
} from "./class-schedules.constants";
import {
  ClassScheduleListParams,
  ClassScheduleRow,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
} from "./class-schedules.types";

async function list(
  params: ClassScheduleListParams = {},
): Promise<Paginated<ClassScheduleRow>> {
  const { data } = await apiClient.get<unknown>(CLASS_SCHEDULES_ENDPOINT, {
    params: buildListParams(params, CLASS_SCHEDULES_PER_PAGE),
  });
  return unwrapPaginated<ClassScheduleRow>(data);
}

async function create(
  input: CreateClassScheduleInput,
): Promise<ClassScheduleRow> {
  const { data } = await apiClient.post<unknown>(
    CLASS_SCHEDULES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<ClassScheduleRow>(data);
}

async function update(
  id: number,
  input: UpdateClassScheduleInput,
): Promise<ClassScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ClassScheduleRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura un horario eliminado (soft-delete). */
async function restore(id: number): Promise<ClassScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<ClassScheduleRow>(data);
}

export const classSchedulesApi = { list, create, update, remove, restore };
