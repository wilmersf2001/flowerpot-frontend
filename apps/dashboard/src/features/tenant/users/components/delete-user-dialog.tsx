"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteUser } from "../lib/users.hooks";
import type { UserRow } from "../lib/users.types";

/** Confirmación de borrado. El padre pasa el usuario a eliminar (o `null` para cerrar). */
export function DeleteUserDialog({
  user,
  onOpenChangeAction,
}: {
  user: UserRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteUser = useDeleteUser();

  async function onConfirm() {
    if (!user) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success(`Usuario "${user.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el usuario.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={user !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${user?.name ?? ""}"`}
      description="El usuario perderá el acceso al panel. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteUser.isPending}
      onConfirm={onConfirm}
    />
  );
}
