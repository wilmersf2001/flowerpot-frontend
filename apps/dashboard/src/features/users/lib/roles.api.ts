import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  PERMISSIONS_ENDPOINT,
  ROLES_ENDPOINT,
  ROLES_PER_PAGE,
} from "./roles.constants";
import { PermissionCatalog, RoleInput, RoleListParams, RoleRow } from "./roles.types";

async function list(params: RoleListParams = {}): Promise<Paginated<RoleRow>> {
  const { data } = await apiClient.get<unknown>(ROLES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? ROLES_PER_PAGE,
    },
  });
  return unwrapPaginated<RoleRow>(data);
}

async function create(input: RoleInput): Promise<RoleRow> {
  const { data } = await apiClient.post<unknown>(ROLES_ENDPOINT, input);
  return unwrapEnvelope<RoleRow>(data);
}

async function update(id: number, input: RoleInput): Promise<RoleRow> {
  const { data } = await apiClient.patch<unknown>(`${ROLES_ENDPOINT}/${id}`, input);
  return unwrapEnvelope<RoleRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${ROLES_ENDPOINT}/${id}`);
}

/** Catálogo de permisos disponibles, agrupado por módulo. */
async function permissions(): Promise<PermissionCatalog> {
  const { data } = await apiClient.get<unknown>(PERMISSIONS_ENDPOINT);
  return unwrapEnvelope<PermissionCatalog>(data);
}

export const rolesApi = { list, create, update, remove, permissions };
