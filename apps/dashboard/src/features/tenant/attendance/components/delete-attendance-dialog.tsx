"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteAttendance } from "../lib/attendance.hooks";
import type { AttendanceRow } from "../lib/attendance.types";

/** Confirmación de borrado. El padre pasa la asistencia a eliminar (o `null` para cerrar). */
export function DeleteAttendanceDialog({
  attendance,
  onOpenChangeAction,
}: {
  attendance: AttendanceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteAttendance = useDeleteAttendance();

  async function onConfirm() {
    if (!attendance) return;
    try {
      await deleteAttendance.mutateAsync(attendance.id);
      toast.success("Asistencia eliminada.");
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar la asistencia.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={attendance !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar asistencia de "${attendance?.member_name ?? ""}"`}
      description="El registro de asistencia se eliminará. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteAttendance.isPending}
      onConfirm={onConfirm}
    />
  );
}
