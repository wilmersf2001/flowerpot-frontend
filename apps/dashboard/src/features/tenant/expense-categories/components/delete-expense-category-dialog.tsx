"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteExpenseCategory } from "../lib/expense-categories.hooks";
import type { ExpenseCategoryRow } from "../lib/expense-categories.types";

/** Confirmación de borrado. El padre pasa la categoría a eliminar (o `null` para cerrar). */
export function DeleteExpenseCategoryDialog({
  category,
  onOpenChangeAction,
}: {
  category: ExpenseCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteCategory = useDeleteExpenseCategory();

  async function onConfirm() {
    if (!category) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success(`Categoría "${category.name}" eliminada.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={category !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${category?.name ?? ""}"`}
      description="No se puede eliminar una categoría con gastos asociados. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteCategory.isPending}
      onConfirm={onConfirm}
    />
  );
}
