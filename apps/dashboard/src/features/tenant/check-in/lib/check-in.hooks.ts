import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { attendanceKeys } from "@/features/tenant/attendance";
import { checkInApi } from "./check-in.api";

/** Socios peruanos: un DNI son exactamente 8 dígitos; cualquier otra cosa es un QR. */
export function isDni(code: string): boolean {
  return /^\d{8}$/.test(code);
}

/**
 * Check-in en la sede activa del switcher. El texto puede venir del lector
 * de QR (que "escribe" el código y pulsa Enter) o de la recepcionista
 * escribiendo el DNI.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (code: string) =>
      checkInApi.checkIn({
        ...(isDni(code) ? { dni: code } : { qr_code: code }),
        branch_id: Number(selectedBranchId),
        source: isDni(code) ? "manual" : "qr",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
