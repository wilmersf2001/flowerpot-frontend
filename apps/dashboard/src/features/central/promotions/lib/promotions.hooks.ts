import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { promotionsApi } from "./promotions.api";
import { promotionKeys } from "./promotions.keys";
import type { PromotionInput, PromotionListParams } from "./promotions.types";

export function usePromotions(params: PromotionListParams = {}) {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: () => promotionsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: promotionKeys.all });
}

export function useCreatePromotion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: PromotionInput) => promotionsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePromotion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<PromotionInput>;
    }) => promotionsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePromotion() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.remove(id),
    onSuccess: invalidate,
  });
}
