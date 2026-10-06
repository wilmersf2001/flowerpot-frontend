import { apiClient, unwrapEnvelope } from "@repo/api-client";
import { toBoolean } from "@/features/_shared/format";
import { AUTH_ME_ENDPOINT } from "./auth.constants";
import type { CurrentUser, CurrentUserBranch, CurrentUserSubscription } from "./auth.types";

function toCurrentUserBranches(raw: unknown): CurrentUserBranch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const branch = item as Record<string, unknown>;
    return { id: String(branch.id), name: String(branch.name ?? "") };
  });
}

function toCurrentUserSubscription(raw: unknown): CurrentUserSubscription | null {
  if (!raw || typeof raw !== "object") return null;
  const subscription = raw as Record<string, unknown>;
  return {
    plan: String(subscription.plan ?? ""),
    status: String(subscription.status ?? ""),
    isTrial: toBoolean(subscription.is_trial),
    startsAt: String(subscription.starts_at ?? ""),
    endsAt: String(subscription.ends_at ?? ""),
    daysRemaining: Number(subscription.days_remaining ?? 0),
  };
}

function toCurrentUser(raw: Record<string, unknown>): CurrentUser {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? ""),
    isOwner: toBoolean(raw.is_owner),
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map(String) : [],
    branches: toCurrentUserBranches(raw.branches),
    subscription: toCurrentUserSubscription(raw.subscription),
  };
}

async function me(): Promise<CurrentUser> {
  const { data } = await apiClient.get<unknown>(AUTH_ME_ENDPOINT);
  return toCurrentUser(unwrapEnvelope<Record<string, unknown>>(data));
}

export const authApi = { me };
