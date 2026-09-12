import { PaymentListParams } from "./payments.types";

/** Fábrica de query-keys de React Query para el módulo de pagos. */
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentListParams) => [...paymentKeys.lists(), params] as const,
};
