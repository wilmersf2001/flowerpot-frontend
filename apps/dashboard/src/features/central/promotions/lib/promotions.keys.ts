import type { PromotionListParams } from "./promotions.types";

export const promotionKeys = {
  all: ["promotions"] as const,
  lists: () => [...promotionKeys.all, "list"] as const,
  list: (params: PromotionListParams) =>
    [...promotionKeys.lists(), params] as const,
};
