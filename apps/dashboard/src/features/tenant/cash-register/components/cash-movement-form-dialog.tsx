"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { AppDialog, Field, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateCashMovement } from "../lib/cash-register.hooks";
import {
  CASH_EXPENSE_CATEGORIES,
  CASH_EXPENSE_CATEGORY_LABELS,
  CASH_INCOME_CATEGORIES,
  CASH_INCOME_CATEGORY_LABELS,
  CASH_PAYMENT_METHODS,
  CASH_PAYMENT_METHOD_LABELS,
} from "../lib/cash-register.constants";
import {
  CASH_MOVEMENT_FORM_FIELDS,
  cashMovementFormDefaults,
  cashMovementFormSchema,
  toCreateCashMovementInput,
  type CashMovementForm,
} from "../lib/cash-register.schema";
import type { CashMovementRow } from "../lib/cash-register.types";

const FORM_ID = "cash-movement-form";

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Egreso" },
];

const INCOME_CATEGORY_OPTIONS: ComboboxOption[] = CASH_INCOME_CATEGORIES.map((category) => ({
  value: category,
  label: CASH_INCOME_CATEGORY_LABELS[category],
}));

const EXPENSE_CATEGORY_OPTIONS: ComboboxOption[] = CASH_EXPENSE_CATEGORIES.map((category) => ({
  value: category,
  label: CASH_EXPENSE_CATEGORY_LABELS[category],
}));

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = CASH_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: CASH_PAYMENT_METHOD_LABELS[method],
}));

/**
 * Diálogo de movimiento manual (`POST /cash-movements`): ventas, retiros,
 * depósitos… (no gastos aprobados en efectivo, esos generan su movimiento
 * automático al aprobarse). Controlado por el padre.
 */
export function CashMovementFormDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const createMovement = useCreateCashMovement();

  const form = useForm<CashMovementForm>({
    resolver: zodResolver(cashMovementFormSchema),
    defaultValues: cashMovementFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "cash-movement");
  const type = useWatch({ control, name: "type" });

  const categoryOptions = useMemo(
    () => (type === "income" ? INCOME_CATEGORY_OPTIONS : EXPENSE_CATEGORY_OPTIONS),
    [type],
  );

  useEffect(() => {
    if (open) reset(cashMovementFormDefaults);
  }, [open, reset]);

  // Al cambiar el tipo, la categoría anterior deja de ser válida.
  useEffect(() => {
    setValue("category", "");
  }, [type, setValue]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<CashMovementForm, CashMovementRow>({
      form,
      fields: CASH_MOVEMENT_FORM_FIELDS,
      submit: (values) => createMovement.mutateAsync(toCreateCashMovementInput(values)),
      successMessage: () => "Movimiento registrado.",
      errorMessage: "No se pudo registrar el movimiento.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Nuevo movimiento"
      description="Registra un ingreso o egreso manual sobre la caja abierta (venta, retiro, depósito…)."
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
            {isSubmitting ? "Registrando…" : "Registrar movimiento"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Tipo" htmlFor="cash-movement-type">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Combobox
                id="cash-movement-type"
                value={field.value}
                onValueChange={field.onChange}
                options={TYPE_OPTIONS}
              />
            )}
          />
        </Field>

        <Field label="Categoría" htmlFor="cash-movement-category" error={errors.category?.message}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Combobox
                id="cash-movement-category"
                value={field.value}
                onValueChange={field.onChange}
                options={categoryOptions}
                searchable
                placeholder="Selecciona una categoría"
                aria-invalid={errors.category ? true : undefined}
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
          <Field
            label="Método de pago"
            htmlFor="cash-movement-payment-method"
            error={errors.payment_method?.message}
          >
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Combobox
                  id="cash-movement-payment-method"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PAYMENT_METHOD_OPTIONS}
                  aria-invalid={errors.payment_method ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <TextField
          {...bind("description")}
          label="Descripción"
          placeholder="Venta proteína Whey 1kg"
        />

        <TextField
          {...bind("reference")}
          label="Referencia"
          hint="Opcional."
          placeholder="VENTA-001234"
        />

        <TextField
          {...bind("movement_at")}
          label="Fecha y hora"
          type="datetime-local"
          hint="Opcional. Si se deja vacío, se usa el momento actual."
        />
      </form>
    </AppDialog>
  );
}
