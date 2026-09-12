"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteExpense } from "../lib/expenses.hooks";
import type { ExpenseRow } from "../lib/expenses.types";

/**
 * Confirmación de borrado. Solo gastos `pending` se pueden eliminar (los
 * aprobados deben anularse). El padre pasa el gasto a eliminar (o `null` para
 * cerrar).
 */
export function DeleteExpenseDialog({
  expense,
  onOpenChangeAction,
}: {
  expense: ExpenseRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteExpense = useDeleteExpense();

  async function onConfirm() {
    if (!expense) return;
    try {
      await deleteExpense.mutateAsync(expense.id);
      toast.success("Gasto eliminado.");
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el gasto.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={expense !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${expense?.description ?? ""}"`}
      description="El gasto se eliminará. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteExpense.isPending}
      onConfirm={onConfirm}
    />
  );
}
