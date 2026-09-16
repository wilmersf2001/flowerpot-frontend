"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteSpecialty } from "../lib/specialties.hooks";
import type { SpecialtyRow } from "../lib/specialties.types";

/** Confirmación de borrado. El padre pasa la especialidad a eliminar (o `null` para cerrar). */
export function DeleteSpecialtyDialog({
  specialty,
  onOpenChangeAction,
}: {
  specialty: SpecialtyRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteSpecialty = useDeleteSpecialty();

  async function onConfirm() {
    if (!specialty) return;
    try {
      await deleteSpecialty.mutateAsync(specialty.id);
      toast.success(`Especialidad "${specialty.name}" eliminada.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar la especialidad.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={specialty !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${specialty?.name ?? ""}"`}
      description="La especialidad se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteSpecialty.isPending}
      onConfirm={onConfirm}
    />
  );
}
