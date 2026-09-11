"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteJobPosition } from "../lib/job-positions.hooks";
import type { JobPositionRow } from "../lib/job-positions.types";

/** Confirmación de borrado. El padre pasa el cargo a eliminar (o `null` para cerrar). */
export function DeleteJobPositionDialog({
  jobPosition,
  onOpenChangeAction,
}: {
  jobPosition: JobPositionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteJobPosition = useDeleteJobPosition();

  async function onConfirm() {
    if (!jobPosition) return;
    try {
      await deleteJobPosition.mutateAsync(jobPosition.id);
      toast.success(`Cargo "${jobPosition.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el cargo.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={jobPosition !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${jobPosition?.name ?? ""}"`}
      description="El cargo se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteJobPosition.isPending}
      onConfirm={onConfirm}
    />
  );
}
