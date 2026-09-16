"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteInstructor } from "../lib/instructors.hooks";
import type { InstructorRow } from "../lib/instructors.types";

/** Confirmación de borrado. El padre pasa el instructor a eliminar (o `null` para cerrar). */
export function DeleteInstructorDialog({
  instructor,
  onOpenChangeAction,
}: {
  instructor: InstructorRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteInstructor = useDeleteInstructor();
  const name = instructor?.staff?.full_name ?? "";

  async function onConfirm() {
    if (!instructor) return;
    try {
      await deleteInstructor.mutateAsync(instructor.id);
      toast.success(`"${name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar al instructor.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={instructor !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${name}"`}
      description="El instructor se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteInstructor.isPending}
      onConfirm={onConfirm}
    />
  );
}
