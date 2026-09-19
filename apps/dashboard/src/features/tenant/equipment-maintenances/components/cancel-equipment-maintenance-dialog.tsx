"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useCancelEquipmentMaintenance } from "../lib/equipment-maintenances.hooks";
import type { EquipmentMaintenanceRow } from "../lib/equipment-maintenances.types";

/** Confirmación para cancelar un mantenimiento `programado` (`PATCH .../cancel`). */
export function CancelEquipmentMaintenanceDialog({
  maintenance,
  onOpenChangeAction,
}: {
  maintenance: EquipmentMaintenanceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const cancelMaintenance = useCancelEquipmentMaintenance();

  async function onConfirm() {
    if (!maintenance) return;
    try {
      await cancelMaintenance.mutateAsync(maintenance.id);
      toast.success("Mantenimiento cancelado.");
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo cancelar el mantenimiento.");
    }
  }

  return (
    <ConfirmDialog
      open={maintenance !== null}
      onOpenChange={onOpenChangeAction}
      title="Cancelar mantenimiento"
      description="El mantenimiento quedará cancelado. El equipo nunca llegó a estar en mantenimiento, así que su estado no cambia."
      confirmLabel="Cancelar mantenimiento"
      destructive
      loading={cancelMaintenance.isPending}
      onConfirm={onConfirm}
    />
  );
}
