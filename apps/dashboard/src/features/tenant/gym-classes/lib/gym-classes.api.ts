import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { GYM_CLASSES_ENDPOINT, GYM_CLASSES_PER_PAGE } from "./gym-classes.constants";
import {
  CreateGymClassInput,
  GymClassListParams,
  GymClassRow,
  UpdateGymClassInput,
} from "./gym-classes.types";

async function list(params: GymClassListParams = {}): Promise<Paginated<GymClassRow>> {
  const { data } = await apiClient.get<unknown>(GYM_CLASSES_ENDPOINT, {
    params: buildListParams(params, GYM_CLASSES_PER_PAGE),
  });
  return unwrapPaginated<GymClassRow>(data);
}

async function create(input: CreateGymClassInput): Promise<GymClassRow> {
  const { data } = await apiClient.post<unknown>(GYM_CLASSES_ENDPOINT, input);
  return unwrapEnvelope<GymClassRow>(data);
}

async function update(id: number, input: UpdateGymClassInput): Promise<GymClassRow> {
  const { data } = await apiClient.patch<unknown>(
    `${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<GymClassRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una clase eliminada (soft-delete). */
async function restore(id: number): Promise<GymClassRow> {
  const { data } = await apiClient.patch<unknown>(
    `${GYM_CLASSES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<GymClassRow>(data);
}

export const gymClassesApi = { list, create, update, remove, restore };
