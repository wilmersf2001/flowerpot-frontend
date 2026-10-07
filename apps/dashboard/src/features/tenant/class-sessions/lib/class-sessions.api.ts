import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  CLASS_SESSIONS_ENDPOINT,
  CLASS_SESSIONS_PER_PAGE,
} from "./class-sessions.constants";
import {
  ClassSessionListParams,
  ClassSessionRow,
  UpdateClassSessionInput,
} from "./class-sessions.types";

async function list(
  params: ClassSessionListParams = {},
): Promise<Paginated<ClassSessionRow>> {
  const { data } = await apiClient.get<unknown>(CLASS_SESSIONS_ENDPOINT, {
    params: buildListParams(params, CLASS_SESSIONS_PER_PAGE),
  });
  return unwrapPaginated<ClassSessionRow>(data);
}

async function update(
  id: number,
  input: UpdateClassSessionInput,
): Promise<ClassSessionRow> {
  const { data } = await apiClient.patch<unknown>(
    `${CLASS_SESSIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ClassSessionRow>(data);
}

export const classSessionsApi = { list, update };
