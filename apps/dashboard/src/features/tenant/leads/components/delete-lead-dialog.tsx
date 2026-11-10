"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteLead } from "../lib/leads.hooks";
import type { LeadRow } from "../lib/leads.types";

/** Confirmación de borrado. Si el lead ya pagó visitas el backend responde 422 con el motivo. */
export function DeleteLeadDialog({
  lead,
  onOpenChangeAction,
}: {
  lead: LeadRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteLead = useDeleteLead();

  async function onConfirm() {
    if (!lead) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success(`"${lead.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el lead.");
    }
  }

  return (
    <ConfirmDialog
      open={lead !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${lead?.name ?? ""}"`}
      description="El lead se eliminará. Si ya pagó visitas, márcalo como perdido o desactívalo en su lugar."
      confirmLabel="Eliminar"
      destructive
      loading={deleteLead.isPending}
      onConfirm={onConfirm}
    />
  );
}
