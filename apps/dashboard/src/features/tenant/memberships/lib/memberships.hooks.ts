import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membershipsApi } from "./memberships.api";
import { membershipKeys } from "./memberships.keys";
import {
  CreateMembershipInput,
  MembershipListParams,
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
