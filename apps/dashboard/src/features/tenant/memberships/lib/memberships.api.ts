import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  MEMBERSHIPS_ENDPOINT,
  MEMBERSHIPS_PER_PAGE,
} from "./memberships.constants";
import {
  CreateMembershipInput,
  MembershipListParams,
  MembershipRow,
  UpdateMembershipInput,
} from "./memberships.types";

/** El backend manda varios campos numéricos como texto. */
function toMembershipRow(raw: Record<string, unknown>): MembershipRow {
  const member = raw.member as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    member_id: String(raw.member_id),
    membership_plan_id: String(raw.membership_plan_id),
    plan_name: String(raw.plan_name ?? ""),
    plan_price_cents: Number(raw.plan_price_cents ?? 0),
    plan_price_formatted: String(raw.plan_price_formatted ?? ""),
    plan_duration_days: Number(raw.plan_duration_days ?? 0),
    starts_at: String(raw.starts_at ?? ""),
    ends_at: String(raw.ends_at ?? ""),
    days_remaining: Number(raw.days_remaining ?? 0),
    is_expired:
      raw.is_expired === true || raw.is_expired === "true" || raw.is_expired === 1,
    status: String(raw.status ?? ""),
    notes: String(raw.notes ?? ""),
    created_at: String(raw.created_at ?? ""),
    member_name: member ? String(member.full_name ?? "") : undefined,
  };
}

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
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toMembershipRow) };
}

async function create(input: CreateMembershipInput): Promise<MembershipRow> {
  const { data } = await apiClient.post<unknown>(MEMBERSHIPS_ENDPOINT, input);
  return toMembershipRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateMembershipInput,
): Promise<MembershipRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERSHIPS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toMembershipRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const membershipsApi = { list, create, update };
