import { apiClient, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  STOCK_MOVEMENTS_ENDPOINT,
  STOCK_MOVEMENTS_PER_PAGE,
} from "./stock-movements.constants";
import {
  StockMovementListParams,
  StockMovementRow,
} from "./stock-movements.types";

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `created_at`.
 */
async function list(
  params: StockMovementListParams = {},
): Promise<Paginated<StockMovementRow>> {
  const { data } = await apiClient.get<unknown>(STOCK_MOVEMENTS_ENDPOINT, {
    params: {
      ...buildListParams(params, STOCK_MOVEMENTS_PER_PAGE),
      sort_by: "created_at",
      sort_order: "desc",
    },
  });
  return unwrapPaginated<StockMovementRow>(data);
}

export const stockMovementsApi = { list };
