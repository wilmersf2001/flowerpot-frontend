import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { USERS_ENDPOINT, USERS_PER_PAGE } from "./users.constants";
import {
  CreateUserInput,
  UpdateUserInput,
  UserListParams,
  UserRow,
} from "./users.types";

async function list(params: UserListParams = {}): Promise<Paginated<UserRow>> {
  const { data } = await apiClient.get<unknown>(USERS_ENDPOINT, {
    params: buildListParams(params, USERS_PER_PAGE),
  });
  return unwrapPaginated<UserRow>(data);
}

async function create(input: CreateUserInput): Promise<UserRow> {
  const { data } = await apiClient.post<unknown>(USERS_ENDPOINT, input);
  return unwrapEnvelope<UserRow>(data);
}

async function update(id: number, input: UpdateUserInput): Promise<UserRow> {
  const { data } = await apiClient.put<unknown>(
    `${USERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<UserRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${USERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Asigna (o reemplaza) el rol de un usuario. `role` es el nombre, no el id. */
async function assignRole(id: number, role: string): Promise<UserRow> {
  const { data } = await apiClient.put<unknown>(
    `${USERS_ENDPOINT}/${encodeURIComponent(id)}/role`,
    { role },
  );
  return unwrapEnvelope<UserRow>(data);
}

export const usersApi = { list, create, update, remove, assignRole };
