import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { paymentsApi } from "./payments.api";
import { paymentKeys } from "./payments.keys";
import {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentListParams,
  UpdatePaymentInput,
} from "./payments.types";
import { useSelectedBranch } from "@/components/branch";

export { useMembershipOptions } from "@/features/tenant/memberships";

/** Lista paginada de pagos, con búsqueda opcional (`search`). */
export function usePayments(params: PaymentListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: PaymentListParams = {
    ...params,
    branch_id: selectedBranchId,
  };
  return useQuery({
    queryKey: paymentKeys.list(listParams),
    queryFn: () => paymentsApi.list(listParams),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) =>
      paymentsApi.create({
        ...input,
        branch_id: selectedBranchId ? Number(selectedBranchId) : null,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePaymentInput }) =>
      paymentsApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentsApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

/** Registra un abono adicional (`POST /payments/{id}/installments`). */
export function useAddInstallment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: CreateInstallmentInput;
    }) => paymentsApi.storeInstallment(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentsApi.refund(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}
