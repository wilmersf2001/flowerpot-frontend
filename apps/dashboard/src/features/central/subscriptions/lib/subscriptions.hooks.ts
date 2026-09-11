import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { subscriptionsApi } from "./subscriptions.api";
import { subscriptionKeys } from "./subscriptions.keys";
import {
  CreateSubscriptionInput,
  SubscriptionListParams,
  UpdateSubscriptionInput,
} from "./subscriptions.types";

/** Lista paginada de suscripciones, con búsqueda opcional (`search`). */
export function useSubscriptions(params: SubscriptionListParams = {}) {
  return useQuery({
    queryKey: subscriptionKeys.list(params),
    queryFn: () => subscriptionsApi.list(params),
    // Al cambiar de página o de búsqueda, conserva la tabla anterior
    // visible mientras llega la nueva (sin parpadeo a "Cargando…").
    placeholderData: keepPreviousData,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      subscriptionsApi.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubscriptionInput }) =>
      subscriptionsApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
}
