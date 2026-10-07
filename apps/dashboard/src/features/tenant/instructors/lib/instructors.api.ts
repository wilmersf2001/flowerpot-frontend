import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  INSTRUCTORS_ENDPOINT,
  INSTRUCTORS_PER_PAGE,
} from "./instructors.constants";
import {
  CreateInstructorInput,
  InstructorListParams,
  InstructorRow,
  UpdateInstructorInput,
} from "./instructors.types";

async function list(
  params: InstructorListParams = {},
): Promise<Paginated<InstructorRow>> {
  const { data } = await apiClient.get<unknown>(INSTRUCTORS_ENDPOINT, {
    params: buildListParams(params, INSTRUCTORS_PER_PAGE),
  });
  return unwrapPaginated<InstructorRow>(data);
}

async function create(input: CreateInstructorInput): Promise<InstructorRow> {
  const { data } = await apiClient.post<unknown>(INSTRUCTORS_ENDPOINT, input);
  return unwrapEnvelope<InstructorRow>(data);
}

async function update(
  id: number,
  input: UpdateInstructorInput,
): Promise<InstructorRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<InstructorRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un instructor eliminado (soft-delete). */
async function restore(id: number): Promise<InstructorRow> {
  const { data } = await apiClient.patch<unknown>(
    `${INSTRUCTORS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<InstructorRow>(data);
}

export const instructorsApi = { list, create, update, remove, restore };
