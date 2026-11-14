import type { BaseListParams } from "@/features/_shared/list-params";

export interface PromotionRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string;
  /** Porcentaje (1-100) o centavos, según `discount_type`. */
  discount_value: number;
  discount_formatted?: string;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  first_time_only: boolean;
}

export interface PromotionInput {
  code: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  is_active: boolean;
  first_time_only: boolean;
}

export interface PromotionListParams extends BaseListParams {
  is_active?: boolean;
  status?: string;
}
