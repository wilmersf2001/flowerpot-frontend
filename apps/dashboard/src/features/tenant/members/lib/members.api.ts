import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { MEMBERS_ENDPOINT, MEMBERS_PER_PAGE } from "./members.constants";
import { CreateMemberInput, MemberListParams, MemberRow, UpdateMemberInput } from "./members.types";

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toMemberRow(raw: Record<string, unknown>): MemberRow {
  const activeMembership = raw.active_membership as Record<string, unknown> | null | undefined;
  return {
    id: String(raw.id),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    full_name: String(raw.full_name ?? ""),
    dni: String(raw.dni ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    birth_date: raw.birth_date == null ? null : String(raw.birth_date),
    age: raw.age == null ? null : Number(raw.age),
    gender: (raw.gender as MemberRow["gender"]) ?? null,
    photo_url: String(raw.photo_url ?? ""),
    qr_code: String(raw.qr_code ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    emergency_contact_name: String(raw.emergency_contact_name ?? ""),
    emergency_contact_phone: String(raw.emergency_contact_phone ?? ""),
    notes: String(raw.notes ?? ""),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
    active_membership_status: activeMembership ? String(activeMembership.status ?? "") : null,
    active_membership_plan_name: activeMembership ? String(activeMembership.plan_name ?? "") : null,
  };
}

async function list(params: MemberListParams = {}): Promise<Paginated<MemberRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(MEMBERS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? MEMBERS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toMemberRow) };
}

async function create(input: CreateMemberInput): Promise<MemberRow> {
  const { data } = await apiClient.post<unknown>(MEMBERS_ENDPOINT, input);
  return toMemberRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateMemberInput): Promise<MemberRow> {
  const { data } = await apiClient.patch<unknown>(
    `${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toMemberRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un socio eliminado (soft-delete). */
async function restore(id: string): Promise<MemberRow> {
  const { data } = await apiClient.post<unknown>(
    `${MEMBERS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toMemberRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const membersApi = { list, create, update, remove, restore, toMemberRow };
