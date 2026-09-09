import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { plansApi } from "./plans.api";
import { planKeys } from "./plans.keys";
import {
  CreatePlanInput,
  PlanListParams,
  PlanRow,
  UpdatePlanInput,
} from "./plans.types";

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

/** Fila de plan -> opción de combobox (nombre + precio como texto secundario). */
const toPlanOption = (plan: PlanRow): ComboboxOption => ({
  value: plan.id,
  label: plan.name,
  hint: plan.price_formatted || undefined,
  keywords: [plan.slug],
});

/**
 * Adaptador para `AsyncCombobox`: planes paginados por scroll, filtrados por
 * `search`. Único filtro que expone hoy `GET /plans`.
 */
export function usePlanOptions(enabled = true) {
  return useAsyncOptions<PlanRow>({
    queryKey: planKeys.options,
    fetchPage: ({ search, page }) =>
      plansApi.list({ search, page, perPage: 20 }),
    toOption: toPlanOption,
    enabled,
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

/**
 * Activa/desactiva un plan al vuelo (el `Switch` de la tabla). Es un
 * `PUT /plans/{id}` con solo `is_active`, pero con actualización optimista:
 * la fila cambia de estado en el acto y se revierte si el backend falla.
 */
export function useTogglePlanActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      plansApi.update(id, { is_active: isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: planKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<PlanRow>>({
        queryKey: planKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<PlanRow>>(key, {
          ...page,
          data: page.data.map((plan) =>
            plan.id === id ? { ...plan, is_active: isActive } : plan,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: planKeys.all }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planKeys.all }),
  });
}
