export { apiClient, createApiClient } from "./client";
export { ApiError, normalizeError } from "./errors";
export { readTenantFromContext, handleUnauthorized } from "./context";
export { unwrapEnvelope, unwrapPaginated, unwrapList } from "./envelope";

export type {
  ApiEnvelope,
  Paginated,
  Resource,
  ApiErrorBody,
  TenantSlug,
  Panel,
} from "@repo/types";
