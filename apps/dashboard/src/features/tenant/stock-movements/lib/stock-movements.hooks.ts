import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { stockMovementsApi } from "./stock-movements.api";
import { stockMovementKeys } from "./stock-movements.keys";
import { StockMovementListParams } from "./stock-movements.types";

/** Historial de movimientos de stock (Kardex), paginado y filtrable. Solo lectura. */
export function useStockMovements(params: StockMovementListParams = {}) {
  return useQuery({
    queryKey: stockMovementKeys.list(params),
    queryFn: () => stockMovementsApi.list(params),
    placeholderData: keepPreviousData,
  });
}
