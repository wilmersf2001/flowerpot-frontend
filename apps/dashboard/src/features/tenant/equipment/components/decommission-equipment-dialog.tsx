"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDecommissionEquipment } from "../lib/equipment.hooks";
import type { EquipmentRow } from "../lib/equipment.types";

/**
 * Confirmación para dar de baja un equipo (`PATCH .../decommission`). El
 * backend la rechaza si el equipo tiene un mantenimiento `programado` o
 * `en_progreso` abierto; ese mensaje de error llega tal cual al toast.
 */
export function DecommissionEquipmentDialog({
  equipment,
  onOpenChangeAction,
}: {
  equipment: EquipmentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const decommissionEquipment = useDecommissionEquipment();

  async function onConfirm() {
    if (!equipment) return;
    try {
      await decommissionEquipment.mutateAsync(equipment.id);
      toast.success(`Equipo "${equipment.name}" dado de baja.`);
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo dar de baja el equipo.");
    }
  }

  return (
    <ConfirmDialog
      open={equipment !== null}
      onOpenChange={onOpenChangeAction}
      title={`Dar de baja "${equipment?.name ?? ""}"`}
      description="El equipo pasará a dado de baja y se considerará retirado. Completa o cancela sus mantenimientos abiertos antes de continuar."
      confirmLabel="Dar de baja"
      destructive
      loading={decommissionEquipment.isPending}
      onConfirm={onConfirm}
    />
  );
}
