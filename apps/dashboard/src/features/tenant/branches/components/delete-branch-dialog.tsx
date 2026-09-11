"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteBranch } from "../lib/branches.hooks";
import type { BranchRow } from "../lib/branches.types";

/** Confirmación de borrado. El padre pasa la sede a eliminar (o `null` para cerrar). */
export function DeleteBranchDialog({
  branch,
  onOpenChangeAction,
}: {
  branch: BranchRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteBranch = useDeleteBranch();

  async function onConfirm() {
    if (!branch) return;
    try {
      await deleteBranch.mutateAsync(branch.id);
      toast.success(`Sede "${branch.name}" eliminada.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar la sede.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={branch !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${branch?.name ?? ""}"`}
      description="La sede se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteBranch.isPending}
      onConfirm={onConfirm}
    />
  );
}
