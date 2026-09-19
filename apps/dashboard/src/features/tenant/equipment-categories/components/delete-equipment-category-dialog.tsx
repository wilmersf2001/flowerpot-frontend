"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteEquipmentCategory } from "../lib/equipment-categories.hooks";
import type { EquipmentCategoryRow } from "../lib/equipment-categories.types";

/** Confirmación de borrado. El padre pasa la categoría a eliminar (o `null` para cerrar). */
export function DeleteEquipmentCategoryDialog({
  category,
  onOpenChangeAction,
}: {
  category: EquipmentCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteCategory = useDeleteEquipmentCategory();

  async function onConfirm() {
    if (!category) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success(`Categoría "${category.name}" eliminada.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={category !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${category?.name ?? ""}"`}
      description="Los equipos que usan esta categoría no se eliminan, pero dejarán de mostrarla. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteCategory.isPending}
      onConfirm={onConfirm}
    />
  );
}
