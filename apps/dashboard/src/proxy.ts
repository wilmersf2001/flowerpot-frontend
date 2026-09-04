import { type NextRequest, NextResponse } from "next/server";

/**
 * apps/dashboard is ONE Next.js app serving TWO panels, picked by subdomain:
 *
 *   admin.flowerpot.pe   -> route group (central)  — SaaS owner
 *   {gym}.flowerpot.pe   -> route group (tenant)   — each gym
 *
 * ⚠️ M0 SKELETON — no real logic yet. This file only documents what each
 * part will do. Everything below currently falls through to `NextResponse.next()`.
 */

// ---------------------------------------------------------------------------
// TODO(M1): resolve the subdomain
// ---------------------------------------------------------------------------
// const host = req.headers.get("host") ?? "";              // e.g. "gymfit.flowerpot.pe"
// const rootDomain = process.env.ROOT_DOMAIN ?? "flowerpot.pe";
// const sub = host.replace(`.${rootDomain}`, "").split(":")[0];
//   - sub === "admin"           -> panel "central"
//   - sub is a gym slug         -> panel "tenant", tenantSlug = sub
//   - apex / www / unknown      -> redirect to the marketing site

// ---------------------------------------------------------------------------
// TODO(M1): rewrite to the right route group
// ---------------------------------------------------------------------------
// Route groups don't change the URL, so the middleware maps the request:
//   - central -> NextResponse.rewrite(new URL(`/(central)${pathname}`, req.url))
//   - tenant  -> NextResponse.rewrite(new URL(`/(tenant)${pathname}`, req.url))
// (or keep groups purely organizational and just guard cross-panel paths).

// ---------------------------------------------------------------------------
// TODO(M1): set the `tenant` cookie for the tenant panel
// ---------------------------------------------------------------------------
// On the tenant panel, persist the slug so `@repo/api-client`'s
// `readTenantFromContext()` can read it and send `X-Tenant`:
//   res.cookies.set("tenant", tenantSlug, {
//     httpOnly: false,      // read by client + server, it's only a routing hint
//     sameSite: "lax",
//     path: "/",
//     domain: `.${rootDomain}`,
//   });
// Clear it on the central panel.

// ---------------------------------------------------------------------------
// TODO(M1): auth guard
// ---------------------------------------------------------------------------
// const sessionCookie = process.env.SESSION_COOKIE_NAME ?? "session";
// const hasSession = req.cookies.has(sessionCookie);   // httpOnly cookie, set by the BFF
// const isPublic = req.nextUrl.pathname === "/login";
// if (!hasSession && !isPublic) {
//   const url = req.nextUrl.clone();
//   url.pathname = "/login";
//   return NextResponse.redirect(url);
// }

export function proxy(_req: NextRequest): NextResponse {
  // M0: pass everything through untouched.
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
