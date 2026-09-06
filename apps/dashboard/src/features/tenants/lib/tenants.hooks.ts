import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { tenantsApi } from "./tenants.api";
import { tenantKeys } from "./tenants.keys";
import type { CreateTenantInput } from "./tenants.types";

/** Lista de gimnasios. */
export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.lists(),
    queryFn: tenantsApi.list,
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
