/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const PROMOTIONS_ENDPOINT = "/promotions";
export const PROMOTIONS_PER_PAGE = 10;

export const PROMOTION_DISCOUNT_TYPES = ["percentage", "fixed"] as const;

export const PROMOTION_DISCOUNT_TYPE_LABELS: Record<
  (typeof PROMOTION_DISCOUNT_TYPES)[number],
  string
> = {
  percentage: "Porcentaje (%)",
  fixed: "Monto fijo (S/)",
};
