import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { BRANCHES_ENDPOINT, BRANCHES_PER_PAGE } from "./branches.constants";
import {
  BranchListParams,
  BranchRow,
  CreateBranchInput,
  UpdateBranchInput,
} from "./branches.types";

async function list(
  params: BranchListParams = {},
): Promise<Paginated<BranchRow>> {
  const { data } = await apiClient.get<unknown>(BRANCHES_ENDPOINT, {
    params: buildListParams(params, BRANCHES_PER_PAGE),
  });
  return unwrapPaginated<BranchRow>(data);
}

async function create(input: CreateBranchInput): Promise<BranchRow> {
  const { data } = await apiClient.post<unknown>(BRANCHES_ENDPOINT, input);
  return unwrapEnvelope<BranchRow>(data);
}

async function update(
  id: number,
  input: UpdateBranchInput,
): Promise<BranchRow> {
  const { data } = await apiClient.patch<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<BranchRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Activa/desactiva una sede. El backend rechaza desactivar la única sede activa. */
async function toggleActive(id: number): Promise<BranchRow> {
  const { data } = await apiClient.patch<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}/toggle-active`,
  );
  return unwrapEnvelope<BranchRow>(data);
}

/** Restaura una sede eliminada (soft-delete). */
async function restore(id: number): Promise<BranchRow> {
  const { data } = await apiClient.post<unknown>(
    `${BRANCHES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<BranchRow>(data);
}

export const branchesApi = {
  list,
  create,
  update,
  remove,
  toggleActive,
  restore,
};
