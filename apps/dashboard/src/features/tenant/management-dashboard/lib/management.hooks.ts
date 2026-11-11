import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { managementApi } from "./management.api";
import { MANAGEMENT_STALE_MS } from "./management.constants";
import { managementKeys } from "./management.keys";
import type { ManagementParams } from "./management.types";

function usePanel<T>(
  panel: string,
  fetcher: (p: ManagementParams) => Promise<T>,
  params: ManagementParams,
) {
  return useQuery({
    queryKey: managementKeys.panel(panel, params),
    queryFn: () => fetcher(params),
    staleTime: MANAGEMENT_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

/**
 * Un hook por panel: cada pestaña pide solo lo suyo (el endpoint completo
 * calcula los 4 paneles, caro si solo se mira uno).
 */
export const useFinancialPanel = (p: ManagementParams) =>
  usePanel("financial", managementApi.financial, p);
export const useMembershipsPanel = (p: ManagementParams) =>
  usePanel("memberships", managementApi.memberships, p);
export const useOperationsPanel = (p: ManagementParams) =>
  usePanel("operations", managementApi.operations, p);
export const useCrmPanel = (p: ManagementParams) => usePanel("crm", managementApi.crm, p);
