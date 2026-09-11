import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { rolesApi } from "./roles.api";
import { permissionKeys, roleKeys } from "./roles.keys";
import { ROLES_PER_PAGE } from "./roles.constants";
import { RoleInput } from "./roles.types";

/**
 * Lista de roles del gimnasio. Es una lista acotada (predeterminados +
 * personalizados), así que se trae completa en una sola página.
 */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => rolesApi.list({ page: 1, perPage: ROLES_PER_PAGE }),
  });
}

/** Catálogo de permisos agrupado por módulo, para la matriz del formulario. */
export function usePermissionCatalog() {
  return useQuery({
    queryKey: permissionKeys.catalog(),
    queryFn: () => rolesApi.permissions(),
    // El catálogo de permisos es fijo (no cambia en runtime); evita refetches.
    staleTime: Infinity,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleInput) => rolesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RoleInput }) =>
      rolesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}
