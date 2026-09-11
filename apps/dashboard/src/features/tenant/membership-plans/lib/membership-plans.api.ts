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

/** El backend manda `price_cents`, `duration_days`, `is_active` y `sort_order` como texto. */
function toMembershipPlanRow(raw: Record<string, unknown>): MembershipPlanRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    price_cents: Number(raw.price_cents ?? 0),
    price_formatted: String(raw.price_formatted ?? ""),
    currency: String(raw.currency ?? ""),
    duration_days: Number(raw.duration_days ?? 0),
    duration_label: String(raw.duration_label ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    sort_order: Number(raw.sort_order ?? 0),
  };
}

async function list(
  params: MembershipPlanListParams = {},
): Promise<Paginated<MembershipPlanRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(MEMBERSHIP_PLANS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? MEMBERSHIP_PLANS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toMembershipPlanRow) };
}

async function create(
  input: CreateMembershipPlanInput,
): Promise<MembershipPlanRow> {
  const { data } = await apiClient.post<unknown>(MEMBERSHIP_PLANS_ENDPOINT, input);
  return toMembershipPlanRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateMembershipPlanInput,
): Promise<MembershipPlanRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERSHIP_PLANS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toMembershipPlanRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const membershipPlansApi = { list, create, update };
