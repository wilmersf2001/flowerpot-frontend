import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
  type Paginated,
} from "@repo/api-client";
import { TENANTS_ENDPOINT, TENANTS_PER_PAGE } from "./tenants.constants";
import type {
  CreateTenantInput,
  CreateTenantResult,
  TenantListParams,
  TenantRow,
} from "./tenants.types";

async function list(
  params: TenantListParams = {},
): Promise<Paginated<TenantRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(TENANTS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? TENANTS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  return unwrapPaginated<TenantRow>(data);
}

async function create(input: CreateTenantInput): Promise<CreateTenantResult> {
  const { data } = await apiClient.post<unknown>(TENANTS_ENDPOINT, input);
  return unwrapEnvelope<CreateTenantResult>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${TENANTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const tenantsApi = { list, create, remove };
