import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { plansApi } from "./plans.api";
import { planKeys } from "./plans.keys";
import { CreatePlanInput, PlanListParams, UpdatePlanInput } from "./plans.types";

/** Lista paginada de plans, con búsqueda opcional (`search`). */
export function usePlans(params: PlanListParams = {}) {
  return useQuery({
    queryKey: planKeys.list(params),
    queryFn: () => plansApi.list(params),
    // Al cambiar de página o de búsqueda, conserva la tabla anterior
    // visible mientras llega la nueva (sin parpadeo a "Cargando…").
    placeholderData: keepPreviousData,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => plansApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planKeys.all }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlanInput }) =>
      plansApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planKeys.all }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planKeys.all }),
  });
}
