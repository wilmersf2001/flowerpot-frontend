import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { toBoolean } from "@/features/_shared/format";
import { SPECIALTIES_ENDPOINT, SPECIALTIES_PER_PAGE } from "./specialties.constants";
import {
  CreateSpecialtyInput,
  SpecialtyListParams,
  SpecialtyRow,
  UpdateSpecialtyInput,
} from "./specialties.types";

function toSpecialtyRow(raw: Record<string, unknown>): SpecialtyRow {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    is_active: toBoolean(raw.is_active),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: SpecialtyListParams = {}): Promise<Paginated<SpecialtyRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(SPECIALTIES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? SPECIALTIES_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toSpecialtyRow) };
}

async function create(input: CreateSpecialtyInput): Promise<SpecialtyRow> {
  const { data } = await apiClient.post<unknown>(SPECIALTIES_ENDPOINT, input);
  return toSpecialtyRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: number, input: UpdateSpecialtyInput): Promise<SpecialtyRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SPECIALTIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toSpecialtyRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${SPECIALTIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una especialidad eliminada (soft-delete). */
async function restore(id: number): Promise<SpecialtyRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SPECIALTIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toSpecialtyRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const specialtiesApi = { list, create, update, remove, restore };
