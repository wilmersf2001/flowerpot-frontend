import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { authKeys } from "./auth.keys";

/**
 * Perfil del usuario autenticado (rol, permisos y sedes asignadas). No cambia
 * durante la sesión, así que se mantiene fresco por un buen rato.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    staleTime: 5 * 60_000,
  });
}

/**
 * `(permission) => boolean` contra los permisos del usuario autenticado. El
 * dueño (`is_owner`) siempre puede, sin depender de que tenga los permisos
 * asignados explícitamente. Mientras `/auth/me` está cargando, permite todo
 * (fail-open) para no ocultar el nav completo por un parpadeo de carga.
 */
export function useHasPermission(): (permission: string | undefined) => boolean {
  const { data: currentUser, isLoading } = useCurrentUser();

  return useMemo(() => {
    return (permission: string | undefined) => {
      if (!permission) return true;
      if (isLoading) return true;
      if (currentUser?.isOwner) return true;
      return currentUser?.permissions.includes(permission) ?? false;
    };
  }, [currentUser, isLoading]);
}
