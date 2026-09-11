"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteRole } from "../lib/roles.hooks";
import type { RoleRow } from "../lib/roles.types";

/** Confirmación de borrado. El padre pasa el rol a eliminar (o `null` para cerrar). */
export function DeleteRoleDialog({
  role,
  onOpenChangeAction,
}: {
  role: RoleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteRole = useDeleteRole();

  async function onConfirm() {
    if (!role) return;
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success(`Rol "${role.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el rol.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={role !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${role?.name ?? ""}"`}
      description={
        role && role.users_count > 0
          ? `Hay ${role.users_count} usuario(s) con este rol. Esta acción no se puede deshacer.`
          : "Esta acción no se puede deshacer."
      }
      confirmLabel="Eliminar"
      destructive
      loading={deleteRole.isPending}
      onConfirm={onConfirm}
    />
  );
}
