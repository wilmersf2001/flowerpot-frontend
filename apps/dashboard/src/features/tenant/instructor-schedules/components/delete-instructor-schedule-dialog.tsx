"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteInstructorSchedule } from "../lib/instructor-schedules.hooks";
import type { InstructorScheduleRow } from "../lib/instructor-schedules.types";

/** Confirmación de borrado. El padre pasa el horario a eliminar (o `null` para cerrar). */
export function DeleteInstructorScheduleDialog({
  schedule,
  onOpenChangeAction,
}: {
  schedule: InstructorScheduleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteSchedule = useDeleteInstructorSchedule();

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
      description="El bloque de disponibilidad se eliminará. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteSchedule.isPending}
      onConfirm={onConfirm}
    />
  );
}
