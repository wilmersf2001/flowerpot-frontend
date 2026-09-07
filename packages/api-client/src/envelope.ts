import type { Paginated } from "@repo/types";

/**
 * Devuelve el `data` de un sobre `{ status, message, data }`.
 * Si `body` ya viene sin sobre (el payload crudo), lo devuelve tal cual.
 */
export function unwrapEnvelope<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/**
 * Normaliza la respuesta de un list a un `Paginated<T>` siempre bien formado,
 * venga con sobre o sin él. Los campos que el backend no mande se completan
 * con valores derivados de las filas.
 */
export function unwrapPaginated<T>(body: unknown): Paginated<T> {
  const node = unwrapEnvelope<unknown>(body);
  const page = (node ?? {}) as Partial<Paginated<T>>;
  const data = Array.isArray(page.data) ? (page.data as T[]) : [];

  return {
    data,
    current_page: page.current_page ?? 1,
    last_page: page.last_page ?? 1,
    per_page: page.per_page ?? data.length,
    from: page.from ?? (data.length ? 1 : null),
    to: page.to ?? (data.length || null),
    total: page.total ?? data.length,
  };
}

/** Atajo cuando solo interesan las filas de un list. */
export function unwrapList<T>(body: unknown): T[] {
  return unwrapPaginated<T>(body).data;
}
