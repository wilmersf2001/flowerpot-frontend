import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ComboboxOption } from "@repo/ui/combobox";
import { fromCents } from "@/features/_shared/format";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { membershipsApi } from "./memberships.api";
import { membershipKeys } from "./memberships.keys";
import {
  CreateMembershipInput,
  MembershipFilters,
  MembershipListParams,
  MembershipRow,
  UpdateMembershipBranchesInput,
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

/** Precio del plan como texto numérico (`"100.00"`), o `""` si no se puede leer. */
function membershipPlanAmount(membership: MembershipRow): string {
  if (membership.plan_price_cents != null) {
    return fromCents(membership.plan_price_cents).toFixed(2);
  }
  // `"S/. 100.00"` -> `"100.00"`
  const amount = Number(
    membership.plan_price_formatted?.replace(/[^\d.]/g, ""),
  );
  return Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : "";
}

/** Fila de membresía -> opción de combobox (socio + plan como texto secundario). */
const toMembershipOption = (membership: MembershipRow): ComboboxOption => ({
  value: String(membership.id),
  label: membership.member_name || String(membership.member_id),
  hint: membership.plan_name || undefined,
  data: { amount: membershipPlanAmount(membership) },
});

/**
 * Adaptador para `AsyncCombobox`: membresías paginadas por scroll, filtradas
 * por `search`. Lo usa el formulario de alta de `payments` (a qué membresía
 * se le está registrando el cobro).
 */
export function useMembershipOptions(
  enabled = true,
  filters: MembershipFilters = {},
) {
  return useAsyncOptions<MembershipRow>({
    queryKey: (search) => membershipKeys.options(search, filters),
    fetchPage: ({ search, page }) =>
      membershipsApi.list({ search, page, perPage: 20, ...filters }),
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

export function useUpdateMembershipBranches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateMembershipBranchesInput;
    }) => membershipsApi.updateBranches(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateMembershipInput }) =>
      membershipsApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}
