"use client";

import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import { formatSoles } from "../lib/payments.constants";
import { useRefundPayment } from "../lib/payments.hooks";
import type { PaymentRow } from "../lib/payments.types";

/**
 * Confirmación de reembolso (`POST /payments/{id}/refund`,
 * `payments.process_refund`). El padre pasa el pago a reembolsar (o `null`
 * para cerrar).
 */
export function RefundPaymentDialog({
  payment,
  onOpenChangeAction,
}: {
  payment: PaymentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const refundPayment = useRefundPayment();

  async function onConfirm() {
    if (!payment) return;
    try {
      await refundPayment.mutateAsync(payment.id);
      toast.success("Devolución procesada.");
      onOpenChangeAction(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo procesar la devolución.";
      toast.error(message);
    }
  }

  return (
    <ConfirmDialog
      open={payment !== null}
      onOpenChange={onOpenChangeAction}
      title={`Reembolsar pago de "${payment?.member_name ?? ""}"`}
      description={
        payment
          ? `Se devolverá ${formatSoles(payment.amount_paid)}. Esta acción no se puede deshacer.`
          : undefined
      }
      confirmLabel="Reembolsar"
      destructive
      loading={refundPayment.isPending}
      onConfirm={onConfirm}
    />
  );
}
