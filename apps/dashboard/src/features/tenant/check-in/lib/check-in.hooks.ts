import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { attendanceKeys } from "@/features/tenant/attendance";
import { checkInApi } from "./check-in.api";

/**
 * Check-in en la sede activa del switcher. Solo acepta el código del QR del
 * socio, leído con la cámara del celular.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (qrCode: string) =>
      checkInApi.checkIn({
        qr_code: qrCode,
        branch_id: Number(selectedBranchId),
        source: "qr",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
