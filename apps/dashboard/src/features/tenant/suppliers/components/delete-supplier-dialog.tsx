"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeleteSupplier } from "../lib/suppliers.hooks";
import type { SupplierRow } from "../lib/suppliers.types";

/** Confirmación de borrado. El padre pasa el proveedor a eliminar (o `null` para cerrar). */
export function DeleteSupplierDialog({
  supplier,
  onOpenChangeAction,
}: {
  supplier: SupplierRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteSupplier = useDeleteSupplier();

  async function onConfirm() {
    if (!supplier) return;
    try {
      await deleteSupplier.mutateAsync(supplier.id);
      toast.success(`Proveedor "${supplier.name}" eliminado.`);
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el proveedor.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={supplier !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar "${supplier?.name ?? ""}"`}
      description="Las órdenes de compra y mantenimientos que usan este proveedor no se eliminan, pero dejarán de mostrarlo. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteSupplier.isPending}
      onConfirm={onConfirm}
    />
  );
}
