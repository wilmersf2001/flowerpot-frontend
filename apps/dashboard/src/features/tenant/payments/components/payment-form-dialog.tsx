"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreatePayment, useMembershipOptions } from "../lib/payments.hooks";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "../lib/payments.constants";
import {
  PAYMENT_FORM_FIELDS,
  paymentFormDefaults,
  paymentFormSchema,
  toCreatePaymentInput,
  type PaymentForm,
} from "../lib/payments.schema";
import type { PaymentRow } from "../lib/payments.types";

const FORM_ID = "payment-form";

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

/**
 * Diálogo de registro manual de pago (`payments.create_manual`). Solo alta:
 * el backend no deja editar montos ni método una vez creado el cobro — los
 * abonos siguientes van por `AddInstallmentDialog` y las notas se corrigen
 * con `PaymentNotesDialog`. Controlado por el padre.
 */
export function PaymentFormDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const createPayment = useCreatePayment();
  const membershipOptions = useMembershipOptions(open);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: paymentFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "payment");

  useEffect(() => {
    if (open) reset(paymentFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<PaymentForm, PaymentRow>({
      form,
      fields: PAYMENT_FORM_FIELDS,
      submit: (values) => createPayment.mutateAsync(toCreatePaymentInput(values)),
      successMessage: () => "Pago registrado.",
      errorMessage: "No se pudo registrar el pago.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Registrar pago"
      description="Registra un cobro manual (efectivo, transferencia, Yape, Plin o POS) sobre una membresía."
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
            {isSubmitting ? "Registrando…" : "Registrar pago"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Membresía"
          htmlFor="payment-membership"
          error={errors.membership_id?.message}
        >
          <Controller
            control={control}
            name="membership_id"
            render={({ field }) => (
              <AsyncCombobox
                id="payment-membership"
                value={field.value}
                onValueChange={field.onChange}
                source={membershipOptions}
                placeholder="Selecciona una membresía"
                searchPlaceholder="Buscar por socio…"
                emptyText="Sin membresías."
                aria-invalid={errors.membership_id ? true : undefined}
              />
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("amount")}
            label="Monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="150.00"
          />
          <TextField
            {...bind("amount_paid")}
            label="Monto pagado"
            hint="El primer abono."
            type="number"
            step="0.01"
            min="0.01"
            placeholder="150.00"
          />
        </div>

        <Field
          label="Método de pago"
          htmlFor="payment-method"
          error={errors.payment_method?.message}
        >
          <Controller
            control={control}
            name="payment_method"
            render={({ field }) => (
              <Combobox
                id="payment-method"
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
          idPrefix="payment"
          label="Fecha de pago"
          hint="Opcional. Si se deja vacío, se usa la fecha y hora actual."
        />

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
