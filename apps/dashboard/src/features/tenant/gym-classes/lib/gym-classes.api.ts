import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { GYM_CLASSES_ENDPOINT, GYM_CLASSES_PER_PAGE } from "./gym-classes.constants";
import {
  CreateGymClassInput,
  GymClassListParams,
  GymClassRow,
  GymClassSpecialty,
  UpdateGymClassInput,
} from "./gym-classes.types";

function toGymClassSpecialty(raw: unknown): GymClassSpecialty | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  return { id: String(s.id), name: String(s.name ?? "") };
}

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toGymClassRow(raw: Record<string, unknown>): GymClassRow {
  return {
    id: String(raw.id),
    specialty_id: raw.specialty_id == null ? null : String(raw.specialty_id),
    specialty: toGymClassSpecialty(raw.specialty),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    duration_minutes: Number(raw.duration_minutes ?? 0),
    max_capacity: Number(raw.max_capacity ?? 0),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: GymClassListParams = {}): Promise<Paginated<GymClassRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(GYM_CLASSES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? GYM_CLASSES_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toGymClassRow) };
}

async function create(input: CreateGymClassInput): Promise<GymClassRow> {
  const { data } = await apiClient.post<unknown>(GYM_CLASSES_ENDPOINT, input);
  return toGymClassRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateGymClassInput): Promise<GymClassRow> {
  const { data } = await apiClient.patch<unknown>(
    `${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toGymClassRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una clase eliminada (soft-delete). */
async function restore(id: string): Promise<GymClassRow> {
  const { data } = await apiClient.patch<unknown>(
    `${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toGymClassRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const gymClassesApi = { list, create, update, remove, restore };
