"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteStaff } from "../lib/staff.hooks";
import type { StaffRow } from "../lib/staff.types";

/** Confirmación de borrado. El padre pasa al miembro del personal a eliminar (o `null` para cerrar). */
export function DeleteStaffDialog({
  staff,
  onOpenChangeAction,
}: {
  staff: StaffRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteStaff = useDeleteStaff();

  async function onConfirm() {
    if (!staff) return;
    try {
      await deleteStaff.mutateAsync(staff.id);
      toast.success(`"${staff.full_name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar al miembro del personal.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={staff !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${staff?.full_name ?? ""}"`}
      description="El miembro del personal se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteStaff.isPending}
      onConfirm={onConfirm}
    />
  );
}
