import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { STAFF_ENDPOINT, STAFF_PER_PAGE } from "./staff.constants";
import {
  CreateStaffInput,
  StaffListParams,
  StaffRow,
  UpdateStaffInput,
} from "./staff.types";

async function list(
  params: StaffListParams = {},
): Promise<Paginated<StaffRow>> {
  const { data } = await apiClient.get<unknown>(STAFF_ENDPOINT, {
    params: buildListParams(params, STAFF_PER_PAGE),
  });
  return unwrapPaginated<StaffRow>(data);
}

async function create(input: CreateStaffInput): Promise<StaffRow> {
  const { data } = await apiClient.post<unknown>(STAFF_ENDPOINT, input);
  return unwrapEnvelope<StaffRow>(data);
}

async function update(id: number, input: UpdateStaffInput): Promise<StaffRow> {
  const { data } = await apiClient.patch<unknown>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<StaffRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${STAFF_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un miembro del personal eliminado (soft-delete). */
async function restore(id: number): Promise<StaffRow> {
  const { data } = await apiClient.patch<unknown>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<StaffRow>(data);
}

export const staffApi = { list, create, update, remove, restore };
