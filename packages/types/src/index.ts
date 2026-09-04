/**
 * Public surface of `@repo/types`.
 *
 * - `./api` re-exports the generated OpenAPI types (placeholder until the
 *   backend exposes Scramble; regenerate with `npm run gen -w @repo/types`).
 * - The hand-written types below are stable transport-level shapes the
 *   frontend needs regardless of the generated output. Keep this list small;
 *   domain models belong in the generated schema.
 */

export type { paths, components, operations, webhooks } from "./api";

/** Multi-tenant discriminator, sent to the Laravel API as `X-Tenant`. */
export type TenantSlug = string;

/** Which dashboard panel a request/session belongs to. */
export type Panel = "central" | "tenant";

/** Laravel `->paginate()` envelope. */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/** Laravel `JsonResource` single-resource envelope. */
export interface Resource<T> {
  data: T;
}

/** Laravel error / validation response (4xx, 5xx, 422). */
export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}
