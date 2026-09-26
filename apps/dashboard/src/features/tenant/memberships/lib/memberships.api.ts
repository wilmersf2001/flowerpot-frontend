import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
  type Paginated,
} from "@repo/api-client";
import { buildListParams } from "@/features/_shared/list-params";
import {
  MEMBERSHIPS_ENDPOINT,
  MEMBERSHIPS_PER_PAGE,
} from "./memberships.constants";
import type {
  CreateMembershipInput,
  MembershipListParams,
  MembershipRow,
  UpdateMembershipBranchesInput,
  UpdateMembershipInput,
} from "./memberships.types";

async function list(
  params: MembershipListParams = {},
): Promise<Paginated<MembershipRow>> {
  const { data } = await apiClient.get<unknown>(MEMBERSHIPS_ENDPOINT, {
    params: buildListParams(params, MEMBERSHIPS_PER_PAGE),
  });
  return unwrapPaginated<MembershipRow>(data);
}

async function create(input: CreateMembershipInput): Promise<MembershipRow> {
  const { data } = await apiClient.post<unknown>(MEMBERSHIPS_ENDPOINT, input);
  return unwrapEnvelope<MembershipRow>(data);
}

async function update(
  id: number,
  input: UpdateMembershipInput,
): Promise<MembershipRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERSHIPS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<MembershipRow>(data);
}

/** Reemplaza las sedes elegidas de una membresía de plan `limited`. */
async function updateBranches(
  id: number,
  input: UpdateMembershipBranchesInput,
): Promise<MembershipRow> {
  const { data } = await apiClient.put<unknown>(
    `${MEMBERSHIPS_ENDPOINT}/${encodeURIComponent(id)}/branches`,
    input,
  );
  return unwrapEnvelope<MembershipRow>(data);
}

export const membershipsApi = { list, create, update, updateBranches };
