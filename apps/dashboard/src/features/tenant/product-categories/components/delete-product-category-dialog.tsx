"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteProductCategory } from "../lib/product-categories.hooks";
import type { ProductCategoryRow } from "../lib/product-categories.types";

/** Confirmación de borrado. El padre pasa la categoría a eliminar (o `null` para cerrar). */
export function DeleteProductCategoryDialog({
  category,
  onOpenChangeAction,
}: {
  category: ProductCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteCategory = useDeleteProductCategory();

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
      description="Los productos que usan esta categoría no se eliminan, pero dejarán de mostrarla. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteCategory.isPending}
      onConfirm={onConfirm}
    />
  );
}
