import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import type { ComboboxOption } from "@repo/ui/combobox";
import { tenantsApi } from "./tenants.api";
import { tenantKeys } from "./tenants.keys";
import type { CreateTenantInput, TenantListParams, TenantRow } from "./tenants.types";

/** Lista paginada de gimnasios, con búsqueda opcional (`search`). */
export function useTenants(params: TenantListParams = {}) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantsApi.list(params),
    // Al cambiar de página o de búsqueda, conserva la tabla anterior
    // visible mientras llega la nueva (sin parpadeo a "Cargando…").
    placeholderData: keepPreviousData,
  });
}

/** Fila de gimnasio -> opción de combobox (se busca por el identificador). */
const toTenantOption = (tenant: TenantRow): ComboboxOption => ({
  value: tenant.id,
  label: tenant.id,
});

/**
 * Adaptador para `AsyncCombobox`: gimnasios paginados por scroll, filtrados
 * por `search`. Único filtro que expone hoy `GET /tenants`.
 */
export function useTenantOptions(enabled = true) {
  return useAsyncOptions<TenantRow>({
    queryKey: tenantKeys.options,
    fetchPage: ({ search, page }) =>
      tenantsApi.list({ search, page, perPage: 20 }),
    toOption: toTenantOption,
    enabled,
  });
}

/** Crea un gimnasio; el backend responde con las credenciales del admin. */
export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) => tenantsApi.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

/** Elimina un gimnasio por su id. */
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
