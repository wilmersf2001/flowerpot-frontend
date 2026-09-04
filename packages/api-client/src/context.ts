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
 * TODO(M1): read the `tenant` cookie.
 *   - Client: parse `document.cookie`.
 *   - Server (RSC / route handler): `cookies().get("tenant")` from
 *     `next/headers`, injected by whoever constructs the request.
 */
export function readTenantFromContext(): string | null {
  return null;
}

/**
 * Called once when the API answers 401. Must drop the httpOnly session cookie
 * (server-side, via a sign-out route handler / server action) and send the
 * user to `/login`.
 *
 * TODO(M1): wire to the real sign-out flow. Deliberately a no-op for now.
 * Never clears a client-side token store, because there isn't one.
 */
export function handleUnauthorized(): void {
  // no-op (M0)
}
