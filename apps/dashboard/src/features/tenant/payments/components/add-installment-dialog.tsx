"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  DateField,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useAddInstallment } from "../lib/payments.hooks";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, formatSoles } from "../lib/payments.constants";
import {
  INSTALLMENT_FORM_FIELDS,
  installmentFormDefaults,
  installmentFormSchema,
  toCreateInstallmentInput,
  type InstallmentForm,
} from "../lib/payments.schema";
import type { PaymentRow } from "../lib/payments.types";

const FORM_ID = "installment-form";

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

/**
 * Diálogo de abono adicional (`POST /payments/{id}/installments`). El padre
 * pasa el pago al que se le agrega el abono (o `null` para cerrar). El
 * backend valida que el monto no supere el saldo pendiente.
 */
export function AddInstallmentDialog({
  payment,
  onOpenChangeAction,
}: {
  payment: PaymentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const addInstallment = useAddInstallment();
  const open = payment !== null;

  const form = useForm<InstallmentForm>({
    resolver: zodResolver(installmentFormSchema),
    defaultValues: installmentFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "installment");

  useEffect(() => {
    if (open) reset(installmentFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<InstallmentForm, PaymentRow>({
      form,
      fields: INSTALLMENT_FORM_FIELDS,
      submit: (values) => {
        if (!payment) throw new Error("No hay pago seleccionado.");
        return addInstallment.mutateAsync({
          id: payment.id,
          input: toCreateInstallmentInput(values),
        });
      },
      successMessage: () => "Abono registrado.",
      errorMessage: "No se pudo registrar el abono.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Agregar abono"
      description={
        payment
          ? `Saldo pendiente: ${formatSoles(payment.balance_due)}.`
          : undefined
      }
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
            {isSubmitting ? "Registrando…" : "Registrar abono"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          {...bind("amount")}
          label="Monto del abono"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="50.00"
        />

        <Field
          label="Método de pago"
          htmlFor="installment-method"
          error={errors.payment_method?.message}
        >
          <Controller
            control={control}
            name="payment_method"
            render={({ field }) => (
              <Combobox
                id="installment-method"
                value={field.value}
                onValueChange={field.onChange}
                options={PAYMENT_METHOD_OPTIONS}
                aria-invalid={errors.payment_method ? true : undefined}
              />
            )}
          />
        </Field>

        <TextField
          {...bind("reference_code")}
          label="Referencia"
          hint="Opcional. Nº de operación Yape, código de transferencia…"
          placeholder="OP-123456"
        />

        <DateField
          form={form}
          name="paid_at"
          idPrefix="installment"
          label="Fecha de pago"
          hint="Opcional. Si se deja vacío, se usa la fecha y hora actual."
        />

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Observaciones del abono…"
        />
      </form>
    </AppDialog>
  );
}
