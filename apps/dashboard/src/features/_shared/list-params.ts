/** Params base que comparte todo `list` paginado del dashboard. */
export interface BaseListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * Filtros extra de un módulo (todo salvo paginación/búsqueda), para reusarlos
 * en query-keys y combobox: `ListFilters<MemberListParams>`.
 */
export type ListFilters<P extends BaseListParams> = Omit<
  P,
  keyof BaseListParams
>;

/**
 * Params de query de un `list`: aplica defaults de paginación, recorta
 * `search` y manda el resto de filtros tal cual (las claves deben ser las del
 * backend, en snake_case). Descarta `undefined`, `null` y `""`.
 *
 * Para filtrar por algo nuevo en un módulo: declararlo en su `ListParams`
 * (`extends BaseListParams`) y pasarlo al hook. El api no se toca.
 */
export function buildListParams<P extends BaseListParams>(
  params: P,
  defaultPerPage: number,
): Record<string, unknown> {
  const { page = 1, perPage, search, ...filters } = params;
  const term = search?.trim();
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  return {
    page,
    per_page: perPage ?? defaultPerPage,
    search: term ? term : undefined,
    ...activeFilters,
  };
}
