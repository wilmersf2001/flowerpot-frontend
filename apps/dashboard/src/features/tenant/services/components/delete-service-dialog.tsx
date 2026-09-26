"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteService } from "../lib/services.hooks";
import type { ServiceRow } from "../lib/services.types";

/** Confirmación de borrado. El padre pasa el servicio a eliminar (o `null` para cerrar). */
export function DeleteServiceDialog({
  service,
  onOpenChangeAction,
}: {
  service: ServiceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteService = useDeleteService();

  async function onConfirm() {
    if (!service) return;
    try {
      await deleteService.mutateAsync(service.id);
      toast.success(`Servicio "${service.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar el servicio.",
      );
    }
  }

  return (
    <ConfirmDialog
      open={service !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${service?.name ?? ""}"`}
      description="El servicio dejará de estar disponible en los planes de membresía. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteService.isPending}
      onConfirm={onConfirm}
    />
  );
}
