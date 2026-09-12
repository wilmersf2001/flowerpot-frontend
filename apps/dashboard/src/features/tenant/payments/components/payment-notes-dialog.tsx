"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useUpdatePayment } from "../lib/payments.hooks";
import {
  PAYMENT_NOTES_FORM_FIELDS,
  paymentNotesFormSchema,
  paymentToNotesForm,
  toUpdatePaymentInput,
  type PaymentNotesForm,
} from "../lib/payments.schema";
import type { PaymentRow } from "../lib/payments.types";

const FORM_ID = "payment-notes-form";

/**
 * Diálogo de edición de notas (`PATCH /payments/{id}`). Es lo único que el
 * backend deja corregir en un pago ya creado — montos, método y membresía se
 * fijan en el alta. El padre pasa el pago a editar (o `null` para cerrar).
 */
export function PaymentNotesDialog({
  payment,
  onOpenChangeAction,
}: {
  payment: PaymentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const updatePayment = useUpdatePayment();
  const open = payment !== null;

  const form = useForm<PaymentNotesForm>({
    resolver: zodResolver(paymentNotesFormSchema),
    defaultValues: { notes: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "payment-notes");

  useEffect(() => {
    if (open && payment) reset(paymentToNotesForm(payment));
  }, [open, payment, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<PaymentNotesForm, PaymentRow>({
      form,
      fields: PAYMENT_NOTES_FORM_FIELDS,
      submit: (values) => {
        if (!payment) throw new Error("No hay pago seleccionado.");
        return updatePayment.mutateAsync({ id: payment.id, input: toUpdatePaymentInput(values) });
      },
      successMessage: () => "Notas actualizadas.",
      errorMessage: "No se pudieron actualizar las notas.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Editar notas del pago"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Observaciones del cobro…"
        />
      </form>
    </AppDialog>
  );
}
