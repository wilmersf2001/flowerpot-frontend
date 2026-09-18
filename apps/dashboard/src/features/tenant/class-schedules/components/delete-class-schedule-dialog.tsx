"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteClassSchedule } from "../lib/class-schedules.hooks";
import type { ClassScheduleRow } from "../lib/class-schedules.types";

/** Confirmación de borrado. El padre pasa el horario a eliminar (o `null` para cerrar). */
export function DeleteClassScheduleDialog({
  schedule,
  onOpenChangeAction,
}: {
  schedule: ClassScheduleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteSchedule = useDeleteClassSchedule();

  async function onConfirm() {
    if (!schedule) return;
    try {
      await deleteSchedule.mutateAsync(schedule.id);
      toast.success("Horario eliminado.");
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el horario.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={schedule !== null}
      onOpenChange={onOpenChangeAction}
      title="Eliminar horario"
      description="El horario recurrente se eliminará. Las sesiones ya generadas no cambian. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteSchedule.isPending}
      onConfirm={onConfirm}
    />
  );
}
