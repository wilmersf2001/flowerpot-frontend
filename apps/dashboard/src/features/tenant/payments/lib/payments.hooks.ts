import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "./payments.api";
import { paymentKeys } from "./payments.keys";
import {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentListParams,
  UpdatePaymentInput,
} from "./payments.types";

export { useMembershipOptions } from "@/features/tenant/memberships";

/** Lista paginada de pagos, con búsqueda opcional (`search`). */
export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentInput }) =>
      paymentsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

/** Registra un abono adicional (`POST /payments/{id}/installments`). */
export function useAddInstallment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateInstallmentInput }) =>
      paymentsApi.storeInstallment(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.refund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}
