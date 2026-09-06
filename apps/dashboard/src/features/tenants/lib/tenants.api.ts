import { apiClient } from "@repo/api-client";
import { TENANTS_ENDPOINT } from "./tenants.constants";
import type {
  CreateTenantInput,
  CreateTenantResult,
  TenantRow,
} from "./tenants.types";

/** Extrae el `data` de un sobre Laravel `{ data: ... }`, o devuelve el crudo. */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function list(): Promise<TenantRow[]> {
  const { data } = await apiClient.get<unknown>(TENANTS_ENDPOINT);
  const rows = unwrap<unknown>(data);
  return Array.isArray(rows) ? (rows as TenantRow[]) : [];
}

async function create(input: CreateTenantInput): Promise<CreateTenantResult> {
  const { data } = await apiClient.post<unknown>(TENANTS_ENDPOINT, input);
  return unwrap<CreateTenantResult>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${TENANTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const tenantsApi = { list, create, remove };
