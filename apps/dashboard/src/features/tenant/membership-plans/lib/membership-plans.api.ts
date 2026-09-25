import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  MEMBERSHIP_PLANS_ENDPOINT,
  MEMBERSHIP_PLANS_PER_PAGE,
} from "./membership-plans.constants";
import {
  CreateMembershipPlanInput,
  MembershipPlanListParams,
  MembershipPlanRow,
  UpdateMembershipPlanInput,
} from "./membership-plans.types";

async function list(
  params: MembershipPlanListParams = {},
): Promise<Paginated<MembershipPlanRow>> {
  const { page: pageNumber = 1, perPage, search, ...filters } = params;
  const term = search?.trim();
  const { data } = await apiClient.get<unknown>(MEMBERSHIP_PLANS_ENDPOINT, {
    params: {
      page: pageNumber,
      per_page: perPage ?? MEMBERSHIP_PLANS_PER_PAGE,
      search: term ? term : undefined,
      ...filters, // filtros extra (is_active, …): basta declararlos en MembershipPlanListParams
    },
  });
  return unwrapPaginated<MembershipPlanRow>(data);
}

async function create(
  input: CreateMembershipPlanInput,
): Promise<MembershipPlanRow> {
  const { data } = await apiClient.post<unknown>(
    MEMBERSHIP_PLANS_ENDPOINT,
    input,
  );
  return unwrapEnvelope<MembershipPlanRow>(data);
}

async function update(
  id: number,
  input: UpdateMembershipPlanInput,
): Promise<MembershipPlanRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERSHIP_PLANS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<MembershipPlanRow>(data);
}

export const membershipPlansApi = { list, create, update };
