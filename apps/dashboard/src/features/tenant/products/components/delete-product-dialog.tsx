"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteProduct } from "../lib/products.hooks";
import type { ProductRow } from "../lib/products.types";

/** Confirmación de borrado. El padre pasa el producto a eliminar (o `null` para cerrar). */
export function DeleteProductDialog({
  product,
  onOpenChangeAction,
}: {
  product: ProductRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteProduct = useDeleteProduct();

  async function onConfirm() {
    if (!product) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`Producto "${product.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el producto.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={product !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${product?.name ?? ""}"`}
      description="El producto se eliminará de la tienda. Si su SKU se reutiliza más adelante, deberás restaurarlo en vez de crear uno nuevo. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteProduct.isPending}
      onConfirm={onConfirm}
    />
  );
}
