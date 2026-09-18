"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteGymClass } from "../lib/gym-classes.hooks";
import type { GymClassRow } from "../lib/gym-classes.types";

/** Confirmación de borrado. El padre pasa la clase a eliminar (o `null` para cerrar). */
export function DeleteGymClassDialog({
  gymClass,
  onOpenChangeAction,
}: {
  gymClass: GymClassRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteGymClass = useDeleteGymClass();

  async function onConfirm() {
    if (!gymClass) return;
    try {
      await deleteGymClass.mutateAsync(gymClass.id);
      toast.success(`Clase "${gymClass.name}" eliminada.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar la clase.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={gymClass !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${gymClass?.name ?? ""}"`}
      description="La clase se eliminará del catálogo. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteGymClass.isPending}
      onConfirm={onConfirm}
    />
  );
}
