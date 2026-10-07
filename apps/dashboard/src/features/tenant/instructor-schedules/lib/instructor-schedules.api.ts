import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  INSTRUCTOR_SCHEDULES_ENDPOINT,
  INSTRUCTOR_SCHEDULES_PER_PAGE,
} from "./instructor-schedules.constants";
import {
  CreateInstructorScheduleInput,
  InstructorScheduleListParams,
  InstructorScheduleRow,
  UpdateInstructorScheduleInput,
} from "./instructor-schedules.types";

async function list(
  params: InstructorScheduleListParams,
): Promise<Paginated<InstructorScheduleRow>> {
  const { data } = await apiClient.get<unknown>(INSTRUCTOR_SCHEDULES_ENDPOINT, {
    params: buildListParams(params, INSTRUCTOR_SCHEDULES_PER_PAGE),
  });
  return unwrapPaginated<InstructorScheduleRow>(data);
}

async function create(
  input: CreateInstructorScheduleInput,
): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.post<unknown>(
    INSTRUCTOR_SCHEDULES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<InstructorScheduleRow>(data);
}

async function update(
  id: number,
  input: UpdateInstructorScheduleInput,
): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<InstructorScheduleRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura un horario eliminado (soft-delete). */
async function restore(id: number): Promise<InstructorScheduleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTOR_SCHEDULES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<InstructorScheduleRow>(data);
}

export const instructorSchedulesApi = { list, create, update, remove, restore };
