"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useReceivePurchaseOrder } from "../lib/purchase-orders.hooks";
import type { PurchaseOrderRow } from "../lib/purchase-orders.types";

/**
 * Confirmación para recibir una orden (`PATCH .../receive`). Se envía sin
 * `received_at` (el backend usa "ahora"). Es total e irreversible desde la
 * API: sube el stock, actualiza el costo de los productos y no se puede deshacer.
 */
export function ReceivePurchaseOrderDialog({
  order,
  onOpenChangeAction,
}: {
  order: PurchaseOrderRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const receiveOrder = useReceivePurchaseOrder();

  async function onConfirm() {
    if (!order) return;
    try {
      await receiveOrder.mutateAsync({ id: order.id, input: {} });
      toast.success("Orden de compra recibida. El stock ya se actualizó.");
      onOpenChangeAction(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo recibir la orden.");
    }
  }

  return (
    <ConfirmDialog
      open={order !== null}
      onOpenChange={onOpenChangeAction}
      title="Recibir orden de compra"
      description="Se sumará la cantidad de cada línea al stock de la sede y se actualizará el costo de los productos. No hay recepción parcial ni forma de deshacerlo después."
      confirmLabel="Recibir"
      loading={receiveOrder.isPending}
      onConfirm={onConfirm}
    />
  );
}
