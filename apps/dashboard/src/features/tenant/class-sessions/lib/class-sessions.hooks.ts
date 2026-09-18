import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classSessionsApi } from "./class-sessions.api";
import { classSessionKeys } from "./class-sessions.keys";
import { ClassSessionListParams, UpdateClassSessionInput } from "./class-sessions.types";

/** Lista paginada de sesiones de clase, con filtros opcionales. */
export function useClassSessions(params: ClassSessionListParams = {}) {
  return useQuery({
    queryKey: classSessionKeys.list(params),
    queryFn: () => classSessionsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Cancela o reasigna el instructor de una sesión puntual. */
export function useUpdateClassSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClassSessionInput }) =>
      classSessionsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classSessionKeys.all }),
  });
}
