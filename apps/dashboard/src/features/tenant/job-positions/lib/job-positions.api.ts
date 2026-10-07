import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  JOB_POSITIONS_ENDPOINT,
  JOB_POSITIONS_PER_PAGE,
} from "./job-positions.constants";
import {
  CreateJobPositionInput,
  JobPositionListParams,
  JobPositionRow,
  UpdateJobPositionInput,
} from "./job-positions.types";

async function list(
  params: JobPositionListParams = {},
): Promise<Paginated<JobPositionRow>> {
  const { data } = await apiClient.get<unknown>(JOB_POSITIONS_ENDPOINT, {
    params: buildListParams(params, JOB_POSITIONS_PER_PAGE),
  });
  return unwrapPaginated<JobPositionRow>(data);
}

async function create(input: CreateJobPositionInput): Promise<JobPositionRow> {
  const { data } = await apiClient.post<unknown>(JOB_POSITIONS_ENDPOINT, input);
  return unwrapEnvelope<JobPositionRow>(data);
}

async function update(
  id: number,
  input: UpdateJobPositionInput,
): Promise<JobPositionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<JobPositionRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un cargo eliminado (soft-delete). */
async function restore(id: number): Promise<JobPositionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<JobPositionRow>(data);
}

export const jobPositionsApi = { list, create, update, remove, restore };
