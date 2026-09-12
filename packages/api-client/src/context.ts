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
 * client-side token to clear, but the httpOnly session cookie is still set
 * (the API rejected the token, it didn't expire the cookie) — `proxy.ts`
 * only checks that the cookie *exists*, so navigating to `/login` without
 * clearing it first makes the middleware bounce us straight back to the
 * panel's landing route, which hits the API again, gets another 401, and
 * loops forever. So: clear the cookie via `/api/auth/logout` first, then do
 * a hard navigation (not `router.push`, to drop all in-memory state).
 *
 * No-op on the server and when we're already on `/login` (avoids a loop).
 */
export function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    .catch(() => {})
    .finally(() => {
      window.location.assign("/login");
    });
}
