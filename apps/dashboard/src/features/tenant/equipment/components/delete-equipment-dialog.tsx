"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteEquipment } from "../lib/equipment.hooks";
import type { EquipmentRow } from "../lib/equipment.types";

/** Confirmación de borrado. El padre pasa el equipo a eliminar (o `null` para cerrar). */
export function DeleteEquipmentDialog({
  equipment,
  onOpenChangeAction,
}: {
  equipment: EquipmentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteEquipment = useDeleteEquipment();

  async function onConfirm() {
    if (!equipment) return;
    try {
      await deleteEquipment.mutateAsync(equipment.id);
      toast.success(`Equipo "${equipment.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el equipo.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={equipment !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${equipment?.name ?? ""}"`}
      description="El equipo se eliminará. Esta acción no valida sus mantenimientos y no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteEquipment.isPending}
      onConfirm={onConfirm}
    />
  );
}
