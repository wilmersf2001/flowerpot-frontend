/**
 * Ambient request context for the API client.
 *
 * Everything here is a STUB for M0. The real implementations arrive with
 * `apps/dashboard/src/middleware.ts` (which will set the `tenant` cookie) and
 * the auth work in M1.
 *
 * Note on auth: the session token lives ONLY in an httpOnly cookie and is
 * attached automatically by the browser / by the BFF forwarding
 * `credentials`. It is never read here and never touches `localStorage`.
 */

/**
 * Returns the current tenant slug, to be sent as the `X-Tenant` header.
 *
 * Client: parses the non-httpOnly `tenant` cookie that `proxy.ts` sets from the
 * subdomain. Server (RSC / route handler): still returns `null` here — server
 * callers must pass `X-Tenant` explicitly via `createApiClient({ headers })`,
 * because `next/headers` can't be imported from this framework-agnostic package.
 */
export function readTenantFromContext(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)tenant=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Called when the API answers 401 (session missing/expired). There is no
 * client-side token to clear; we just bounce the browser to `/login`, where
 * `proxy.ts` takes over. A hard navigation (not `router.push`) is deliberate:
 * it drops all in-memory state of the expired session.
 *
 * No-op on the server and when we're already on `/login` (avoids a loop).
 */
export function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  window.location.assign("/login");
}
