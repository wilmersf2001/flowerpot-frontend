"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog, formatDate } from "@/features/_shared";
import { useDeletePurchaseOrder } from "../lib/purchase-orders.hooks";
import type { PurchaseOrderRow } from "../lib/purchase-orders.types";

/** Confirmación de borrado. Solo se puede eliminar una orden `pending`. */
export function DeletePurchaseOrderDialog({
  order,
  onOpenChangeAction,
}: {
  order: PurchaseOrderRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deleteOrder = useDeletePurchaseOrder();

  async function onConfirm() {
    if (!order) return;
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Orden de compra eliminada.");
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar la orden.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={order !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar orden del ${order ? formatDate(order.order_date) : ""}`}
      description="La orden se eliminará. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deleteOrder.isPending}
      onConfirm={onConfirm}
    />
  );
}
