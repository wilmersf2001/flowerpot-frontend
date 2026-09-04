export { apiClient, createApiClient } from "./client";
export { ApiError, normalizeError } from "./errors";
export { readTenantFromContext, handleUnauthorized } from "./context";

export type {
  Paginated,
  Resource,
  ApiErrorBody,
  TenantSlug,
  Panel,
} from "@repo/types";
