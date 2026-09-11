import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { membershipPlansApi } from "./membership-plans.api";
import { membershipPlanKeys } from "./membership-plans.keys";
import {
  CreateMembershipPlanInput,
  MembershipPlanListParams,
  MembershipPlanRow,
  UpdateMembershipPlanInput,
} from "./membership-plans.types";

/** Lista paginada de planes de membresía, con búsqueda opcional (`search`). */
export function useMembershipPlans(params: MembershipPlanListParams = {}) {
  return useQuery({
    queryKey: membershipPlanKeys.list(params),
    queryFn: () => membershipPlansApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Fila de plan -> opción de combobox (nombre + precio como texto secundario). */
const toMembershipPlanOption = (plan: MembershipPlanRow): ComboboxOption => ({
  value: plan.id,
  label: plan.name,
  hint: plan.price_formatted || undefined,
});

/**
 * Adaptador para `AsyncCombobox`: planes de membresía paginados por scroll,
 * filtrados por `search`. Lo usa el formulario de alta de `memberships`.
 */
export function useMembershipPlanOptions(enabled = true) {
  return useAsyncOptions<MembershipPlanRow>({
    queryKey: membershipPlanKeys.options,
    fetchPage: ({ search, page }) =>
      membershipPlansApi.list({ search, page, perPage: 20 }),
    toOption: toMembershipPlanOption,
    enabled,
  });
}

export function useCreateMembershipPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMembershipPlanInput) =>
      membershipPlansApi.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipPlanKeys.all }),
  });
}

export function useUpdateMembershipPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateMembershipPlanInput;
    }) => membershipPlansApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipPlanKeys.all }),
  });
}

/**
 * Activa/desactiva un plan de membresía al vuelo (el `Switch` de la tabla).
 * Es un `PATCH /membership-plans/{id}` con solo `is_active`, con actualización
 * optimista: la fila cambia de estado en el acto y se revierte si falla.
 */
export function useToggleMembershipPlanActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      membershipPlansApi.update(id, { is_active: isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: membershipPlanKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<MembershipPlanRow>>({
        queryKey: membershipPlanKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<MembershipPlanRow>>(key, {
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
      queryClient.invalidateQueries({ queryKey: membershipPlanKeys.all }),
  });
}
