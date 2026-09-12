import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { membershipsApi } from "./memberships.api";
import { membershipKeys } from "./memberships.keys";
import {
  CreateMembershipInput,
  MembershipListParams,
  MembershipRow,
  UpdateMembershipInput,
} from "./memberships.types";

export { useMembershipPlanOptions } from "@/features/tenant/membership-plans";
export { useMemberOptions } from "@/features/tenant/members";

/** Lista paginada de membresías, con búsqueda opcional (`search`). */
export function useMemberships(params: MembershipListParams = {}) {
  return useQuery({
    queryKey: membershipKeys.list(params),
    queryFn: () => membershipsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Fila de membresía -> opción de combobox (socio + plan como texto secundario). */
const toMembershipOption = (membership: MembershipRow): ComboboxOption => ({
  value: membership.id,
  label: membership.member_name || membership.member_id,
  hint: membership.plan_name || undefined,
});

/**
 * Adaptador para `AsyncCombobox`: membresías paginadas por scroll, filtradas
 * por `search`. Lo usa el formulario de alta de `payments` (a qué membresía
 * se le está registrando el cobro).
 */
export function useMembershipOptions(enabled = true) {
  return useAsyncOptions<MembershipRow>({
    queryKey: membershipKeys.options,
    fetchPage: ({ search, page }) =>
      membershipsApi.list({ search, page, perPage: 20 }),
    toOption: toMembershipOption,
    enabled,
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMembershipInput) => membershipsApi.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMembershipInput }) =>
      membershipsApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}
