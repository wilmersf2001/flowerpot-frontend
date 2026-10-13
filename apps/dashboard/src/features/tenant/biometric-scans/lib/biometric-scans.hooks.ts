import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { biometricScansApi } from "./biometric-scans.api";
import { BIOMETRIC_SCANS_REFRESH_MS } from "./biometric-scans.constants";
import { biometricScanKeys } from "./biometric-scans.keys";
import type { BiometricScanListParams } from "./biometric-scans.types";

/**
 * Bitácora de marcaciones de la sede activa. Se refresca sola cada pocos
 * segundos (y se pausa si la pestaña no está visible).
 */
export function useBiometricScans(
  params: Omit<BiometricScanListParams, "branch_id"> = {},
  enabled = true,
) {
  const { selectedBranchId } = useSelectedBranch();
  const full: BiometricScanListParams = {
    ...params,
    branch_id: selectedBranchId ?? undefined,
  };
  return useQuery({
    queryKey: biometricScanKeys.list(full),
    queryFn: () => biometricScansApi.list(full),
    placeholderData: keepPreviousData,
    refetchInterval: BIOMETRIC_SCANS_REFRESH_MS,
    enabled: enabled && selectedBranchId !== null,
  });
}

/** Avisos (alertas) todavía sin atender. */
export function usePendingBiometricAlerts(enabled = true) {
  return useBiometricScans({ pending: "1" }, enabled);
}

export function useAcknowledgeBiometricScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => biometricScansApi.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: biometricScanKeys.all }),
  });
}
