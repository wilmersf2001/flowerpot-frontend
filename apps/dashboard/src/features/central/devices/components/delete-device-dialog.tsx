"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteDevice } from "../lib/devices.hooks";
import type { DeviceRow } from "../lib/devices.types";

/** Confirmación de retiro. El padre pasa el lector (o `null` para cerrar). */
export function DeleteDeviceDialog({
  device,
  onOpenChangeAction,
}: {
  device: DeviceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteDevice = useDeleteDevice();

  async function onConfirm() {
    if (!device) return;
    try {
      await deleteDevice.mutateAsync(device.id);
      toast.success(`Lector "${device.serial_number}" retirado.`);
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo retirar el lector.",
      );
    }
  }

  return (
    <ConfirmDialog
      open={device !== null}
      onOpenChange={onOpenChangeAction}
      title={`Retirar "${device?.serial_number ?? ""}"`}
      description="El lector deja de estar asignado al gimnasio. Podrás asignarlo de nuevo con su número de serie."
      confirmLabel="Retirar"
      destructive
      loading={deleteDevice.isPending}
      onConfirm={onConfirm}
    />
  );
}
