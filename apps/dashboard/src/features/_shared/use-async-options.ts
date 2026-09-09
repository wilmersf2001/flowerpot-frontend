"use client";

import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  type QueryKey,
} from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useDebouncedValue } from "./use-debounced-value";

/** Lo que `useAsyncOptions` entrega a un `AsyncCombobox`. */
export type AsyncOptions = {
  options: ComboboxOption[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  search: string;
  setSearch: (value: string) => void;
  isError: boolean;
};

export type UseAsyncOptionsConfig<T> = {
  /** Query-key en función del texto buscado (con debounce ya aplicado). */
  queryKey: (search: string) => QueryKey;
  /** Trae una página del list del modelo (`{ search, page }` -> `Paginated<T>`). */
  fetchPage: (args: { search: string; page: number }) => Promise<Paginated<T>>;
  /** Mapea una fila del modelo a una opción del combobox. Debe ser estable. */
  toOption: (row: T) => ComboboxOption;
  enabled?: boolean;
  debounceMs?: number;
};

/**
 * Motor genérico de un combobox asíncrono: búsqueda con debounce + scroll
 * infinito sobre el `list()` paginado de cualquier modelo. No conoce endpoints
 * ni `*ListParams`: eso lo decide el adaptador por modelo (`useTenantOptions`,
 * `usePlanOptions`, …).
 */
export function useAsyncOptions<T>({
  queryKey,
  fetchPage,
  toOption,
  enabled = true,
  debounceMs = 300,
}: UseAsyncOptionsConfig<T>): AsyncOptions {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), debounceMs);

  const query = useInfiniteQuery({
    queryKey: queryKey(debouncedSearch),
    queryFn: ({ pageParam }) =>
      fetchPage({ search: debouncedSearch, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    enabled,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => {
    const rows = query.data?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<string>();
    const result: ComboboxOption[] = [];
    for (const row of rows) {
      const option = toOption(row);
      if (seen.has(option.value)) continue;
      seen.add(option.value);
      result.push(option);
    }
    return result;
  }, [query.data, toOption]);

  return {
    options,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    search,
    setSearch,
    isError: query.isError,
  };
}
