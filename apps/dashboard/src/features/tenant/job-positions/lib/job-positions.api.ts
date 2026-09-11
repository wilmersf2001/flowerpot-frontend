import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { JOB_POSITIONS_ENDPOINT, JOB_POSITIONS_PER_PAGE } from "./job-positions.constants";
import {
  CreateJobPositionInput,
  JobPositionListParams,
  JobPositionRow,
  UpdateJobPositionInput,
} from "./job-positions.types";

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toJobPositionRow(raw: Record<string, unknown>): JobPositionRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    staff_count: typeof raw.staff_count === "number" ? raw.staff_count : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: JobPositionListParams = {}): Promise<Paginated<JobPositionRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(JOB_POSITIONS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? JOB_POSITIONS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toJobPositionRow) };
}

async function create(input: CreateJobPositionInput): Promise<JobPositionRow> {
  const { data } = await apiClient.post<unknown>(JOB_POSITIONS_ENDPOINT, input);
  return toJobPositionRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateJobPositionInput): Promise<JobPositionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toJobPositionRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un cargo eliminado (soft-delete). */
async function restore(id: string): Promise<JobPositionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${JOB_POSITIONS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toJobPositionRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const jobPositionsApi = { list, create, update, remove, restore };
