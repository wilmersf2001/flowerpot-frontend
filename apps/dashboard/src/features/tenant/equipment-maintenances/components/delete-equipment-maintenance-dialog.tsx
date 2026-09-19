"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteEquipmentMaintenance } from "../lib/equipment-maintenances.hooks";
import type { EquipmentMaintenanceRow } from "../lib/equipment-maintenances.types";

/**
 * Confirmación de borrado. El backend no valida el estado ni revierte el
 * estado del equipo, así que el padre solo ofrece esta acción para
 * mantenimientos `programado`, `completado` o `cancelado` (nunca `en_progreso`).
 */
export function DeleteEquipmentMaintenanceDialog({
  maintenance,
  onOpenChangeAction,
}: {
  maintenance: EquipmentMaintenanceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteMaintenance = useDeleteEquipmentMaintenance();

  async function onConfirm() {
    if (!maintenance) return;
    try {
      await deleteMaintenance.mutateAsync(maintenance.id);
      toast.success("Mantenimiento eliminado.");
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el mantenimiento.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={maintenance !== null}
      onOpenChange={onOpenChangeAction}
      title="Eliminar mantenimiento"
      description="El mantenimiento se eliminará. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteMaintenance.isPending}
      onConfirm={onConfirm}
    />
  );
}
