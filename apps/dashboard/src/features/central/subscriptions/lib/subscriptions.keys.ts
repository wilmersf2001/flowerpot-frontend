import { SubscriptionListParams } from "./subscriptions.types";

/** Fábrica de query-keys de React Query para el módulo de suscripciones. */
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (params: SubscriptionListParams) =>
    [...subscriptionKeys.lists(), params] as const,
};
