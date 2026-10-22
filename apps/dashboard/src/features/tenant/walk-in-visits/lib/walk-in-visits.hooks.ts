import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { cashRegisterKeys } from "@/features/tenant/cash-register";
import { leadKeys } from "@/features/tenant/leads";
import { walkInVisitsApi } from "./walk-in-visits.api";
import { walkInVisitKeys } from "./walk-in-visits.keys";
import type { DayPassInput, VisitorsReportParams, WalkInVisitListParams } from "./walk-in-visits.types";

/** Libro de visitas de la sede activa. */
export function useWalkInVisits(params: WalkInVisitListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: WalkInVisitListParams = { ...params, branch_id: selectedBranchId };
  return useQuery({
    queryKey: walkInVisitKeys.list(listParams),
    queryFn: () => walkInVisitsApi.list(listParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

export function useVisitorsReport(params: VisitorsReportParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const reportParams: VisitorsReportParams = { ...params, branch_id: selectedBranchId };
  return useQuery({
    queryKey: walkInVisitKeys.report(reportParams),
    queryFn: () => walkInVisitsApi.report(reportParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

/** Un cobro/devolución toca el libro, los leads (visitas) y la caja. */
function useInvalidateAfterPayment() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: walkInVisitKeys.all });
    queryClient.invalidateQueries({ queryKey: leadKeys.all });
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
  };
}

export function useChargeDayPass() {
  const invalidate = useInvalidateAfterPayment();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: DayPassInput) => {
      if (selectedBranchId == null) throw new Error("Selecciona una sede.");
      return walkInVisitsApi.chargeDayPass(selectedBranchId, input);
    },
    onSuccess: invalidate,
  });
}

export function useRefundVisit() {
  const invalidate = useInvalidateAfterPayment();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => walkInVisitsApi.refund(id, reason),
    onSuccess: invalidate,
  });
}
