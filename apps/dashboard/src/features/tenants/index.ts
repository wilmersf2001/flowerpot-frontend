export { TenantsPage } from "./tenants-page";

export { useTenants, useCreateTenant, useDeleteTenant } from "./lib/tenants.hooks";
export { tenantsApi } from "./lib/tenants.api";
export type {
  TenantRow,
  CreateTenantInput,
  CreateTenantResult,
} from "./lib/tenants.types";
