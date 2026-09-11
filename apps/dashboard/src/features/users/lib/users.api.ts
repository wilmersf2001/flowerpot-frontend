import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { USERS_ENDPOINT, USERS_PER_PAGE } from "./users.constants";
import { CreateUserInput, UpdateUserInput, UserListParams, UserRow } from "./users.types";

/** El backend manda `is_owner` con un tipo inconsistente ("true"/true/1). */
function toUserRow(raw: Record<string, unknown>): UserRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? ""),
    is_owner: raw.is_owner === true || raw.is_owner === "true" || raw.is_owner === 1,
  };
}

async function list(params: UserListParams = {}): Promise<Paginated<UserRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(USERS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? USERS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toUserRow) };
}

async function create(input: CreateUserInput): Promise<UserRow> {
  const { data } = await apiClient.post<unknown>(USERS_ENDPOINT, input);
  return toUserRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateUserInput): Promise<UserRow> {
  const { data } = await apiClient.put<unknown>(
    `${USERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toUserRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${USERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Asigna (o reemplaza) el rol de un usuario. `role` es el nombre, no el id. */
async function assignRole(id: string, role: string): Promise<UserRow> {
  const { data } = await apiClient.put<unknown>(
    `${USERS_ENDPOINT}/${encodeURIComponent(id)}/role`,
    { role },
  );
  return toUserRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const usersApi = { list, create, update, remove, assignRole };
