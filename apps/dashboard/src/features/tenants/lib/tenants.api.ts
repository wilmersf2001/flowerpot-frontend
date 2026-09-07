import { apiClient, unwrapEnvelope, unwrapList } from "@repo/api-client";
import { TENANTS_ENDPOINT } from "./tenants.constants";
import type {
  CreateTenantInput,
  CreateTenantResult,
  TenantRow,
} from "./tenants.types";

async function list(): Promise<TenantRow[]> {
  const { data } = await apiClient.get<unknown>(TENANTS_ENDPOINT);
  return unwrapList<TenantRow>(data);
}

async function create(input: CreateTenantInput): Promise<CreateTenantResult> {
  const { data } = await apiClient.post<unknown>(TENANTS_ENDPOINT, input);
  return unwrapEnvelope<CreateTenantResult>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${TENANTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const tenantsApi = { list, create, remove };
