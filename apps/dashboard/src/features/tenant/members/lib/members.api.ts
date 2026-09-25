import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
  type Paginated,
} from "@repo/api-client";
import { buildListParams } from "@/features/_shared/list-params";
import { MEMBERS_ENDPOINT, MEMBERS_PER_PAGE } from "./members.constants";
import type {
  CreateMemberInput,
  MemberListParams,
  MemberRow,
  UpdateMemberInput,
} from "./members.types";

async function list(
  params: MemberListParams = {},
): Promise<Paginated<MemberRow>> {
  const { data } = await apiClient.get<unknown>(MEMBERS_ENDPOINT, {
    params: buildListParams(params, MEMBERS_PER_PAGE),
  });
  return unwrapPaginated<MemberRow>(data);
}

async function create(input: CreateMemberInput): Promise<MemberRow> {
  const { data } = await apiClient.post<unknown>(MEMBERS_ENDPOINT, input);
  return unwrapEnvelope<MemberRow>(data);
}

async function update(
  id: number,
  input: UpdateMemberInput,
): Promise<MemberRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<MemberRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un socio eliminado (soft-delete). */
async function restore(id: number): Promise<MemberRow> {
  const { data } = await apiClient.post<unknown>(
    `${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<MemberRow>(data);
}

export const membersApi = { list, create, update, remove, restore };
