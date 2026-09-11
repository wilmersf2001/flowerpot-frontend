import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { STAFF_ENDPOINT, STAFF_PER_PAGE } from "./staff.constants";
import {
  CreateStaffInput,
  StaffBranch,
  StaffListParams,
  StaffRow,
  UpdateStaffInput,
} from "./staff.types";

function toStaffBranches(raw: unknown): StaffBranch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((branch) => {
    const b = branch as Record<string, unknown>;
    return { id: String(b.id), name: String(b.name ?? "") };
  });
}

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toStaffRow(raw: Record<string, unknown>): StaffRow {
  const jobPosition = raw.job_position as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    full_name: String(raw.full_name ?? ""),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    dni: String(raw.dni ?? ""),
    phone: String(raw.phone ?? ""),
    email: String(raw.email ?? ""),
    salary: String(raw.salary ?? ""),
    hire_date: raw.hire_date == null ? null : String(raw.hire_date),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    job_position_id: jobPosition ? String(jobPosition.id) : null,
    job_position_name: jobPosition ? String(jobPosition.name ?? "") : null,
    branches: toStaffBranches(raw.branches),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: StaffListParams = {}): Promise<Paginated<StaffRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(STAFF_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? STAFF_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toStaffRow) };
}

async function create(input: CreateStaffInput): Promise<StaffRow> {
  const { data } = await apiClient.post<unknown>(STAFF_ENDPOINT, input);
  return toStaffRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateStaffInput): Promise<StaffRow> {
  const { data } = await apiClient.patch<unknown>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toStaffRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${STAFF_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un miembro del personal eliminado (soft-delete). */
async function restore(id: string): Promise<StaffRow> {
  const { data } = await apiClient.patch<unknown>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toStaffRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const staffApi = { list, create, update, remove, restore };
