import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
  type Paginated,
} from "@repo/api-client";
import {
  MEMBERSHIPS_ENDPOINT,
  MEMBERSHIPS_PER_PAGE,
} from "./memberships.constants";
import type {
  CreateMembershipInput,
  MembershipListParams,
  MembershipRow,
  UpdateMembershipInput,
} from "./memberships.types";

async function list(
  params: MembershipListParams = {},
): Promise<Paginated<MembershipRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(MEMBERSHIPS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? MEMBERSHIPS_PER_PAGE,
      search: search ? search : undefined,
    },
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

export const membershipsApi = { list, create, update };
