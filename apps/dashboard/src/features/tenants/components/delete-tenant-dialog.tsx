"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteTenant } from "../lib/tenants.hooks";
import type { TenantRow } from "../lib/tenants.types";

/**
 * Confirmación de borrado. El padre pasa el gimnasio a eliminar (o `null` para
 * cerrar).
 */
export function DeleteTenantDialog({
  tenant,
  onOpenChangeAction,
}: {
  tenant: TenantRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteTenant = useDeleteTenant();

  async function onConfirm() {
    if (!tenant) return;
    try {
      await deleteTenant.mutateAsync(tenant.id);
      toast.success(`Gimnasio "${tenant.id}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el gimnasio.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={tenant !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${tenant?.id ?? ""}"`}
      description="Se elimina el gimnasio y todos sus datos. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteTenant.isPending}
      onConfirm={onConfirm}
    />
  );
}
