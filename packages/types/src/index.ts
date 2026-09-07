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

/**
 * Sobre estándar de la API. Todo endpoint responde con esta forma:
 *   `{ status: "success", message: string, data: <payload> }`
 * En un list, `<payload>` es un `Paginated<T>`; en el resto, el recurso directo.
 */
export interface ApiEnvelope<T> {
  status: "success";
  message: string;
  data: T;
}

/**
 * Cuerpo de un list: el paginador de Laravel (`->paginate()`) recortado a lo
 * que el front consume. Se omiten a propósito:
 *   - `links[]`      → labels con HTML (`&laquo;`) pensados para Blade
 *   - `*_url`,`path` → URLs absolutas que una SPA no sigue (y traen el host interno)
 */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
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
