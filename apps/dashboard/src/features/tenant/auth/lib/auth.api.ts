import { apiClient, unwrapEnvelope } from "@repo/api-client";
import { AUTH_ME_ENDPOINT } from "./auth.constants";
import type { CurrentUser, CurrentUserBranch } from "./auth.types";

function toCurrentUserBranches(raw: unknown): CurrentUserBranch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const branch = item as Record<string, unknown>;
    return { id: String(branch.id), name: String(branch.name ?? "") };
  });
}

function toCurrentUser(raw: Record<string, unknown>): CurrentUser {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? ""),
    isOwner: raw.is_owner === true || raw.is_owner === "true" || raw.is_owner === 1,
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map(String) : [],
    branches: toCurrentUserBranches(raw.branches),
  };
}

async function me(): Promise<CurrentUser> {
  const { data } = await apiClient.get<unknown>(AUTH_ME_ENDPOINT);
  return toCurrentUser(unwrapEnvelope<Record<string, unknown>>(data));
}

export const authApi = { me };
