"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteMember } from "../lib/members.hooks";
import type { MemberRow } from "../lib/members.types";

/** Confirmación de borrado. El padre pasa el socio a eliminar (o `null` para cerrar). */
export function DeleteMemberDialog({
  member,
  onOpenChangeAction,
}: {
  member: MemberRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteMember = useDeleteMember();

  async function onConfirm() {
    if (!member) return;
    try {
      await deleteMember.mutateAsync(member.id);
      toast.success(`Socio "${member.full_name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el socio.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={member !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${member?.full_name ?? ""}"`}
      description="El socio se eliminará del gimnasio. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteMember.isPending}
      onConfirm={onConfirm}
    />
  );
}
