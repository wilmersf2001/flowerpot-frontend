import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import type { PlanRow } from "../lib/plans.types";
import { useDeletePlan } from "../lib/plans.hooks";

export function DeletePlanDialog({
  plan,
  onOpenChangeAction,
}: {
  plan: PlanRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deletePlan = useDeletePlan();

  async function onConfirm() {
    if (!plan) return;
    try {
      await deletePlan.mutateAsync(plan.id);
      toast.success(`Plan "${plan.id}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar el plan.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={plan !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${plan?.id ?? ""}"`}
      description="Se elimina el plan y todos sus datos. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deletePlan.isPending}
      onConfirm={onConfirm}
    />
  );
}
