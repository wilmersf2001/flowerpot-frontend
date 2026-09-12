"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { useDeletePayment } from "../lib/payments.hooks";
import type { PaymentRow } from "../lib/payments.types";

/** Confirmación de borrado. El padre pasa el pago a eliminar (o `null` para cerrar). */
export function DeletePaymentDialog({
  payment,
  onOpenChangeAction,
}: {
  payment: PaymentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const deletePayment = useDeletePayment();

  async function onConfirm() {
    if (!payment) return;
    try {
      await deletePayment.mutateAsync(payment.id);
      toast.success("Pago eliminado.");
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el pago.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={payment !== null}
      onOpenChange={onOpenChangeAction}
      title={`Eliminar pago de "${payment?.member_name ?? ""}"`}
      description="El pago y sus abonos se eliminarán. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      destructive
      loading={deletePayment.isPending}
      onConfirm={onConfirm}
    />
  );
}
