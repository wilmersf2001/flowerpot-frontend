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
import { useCreateExpense, useExpenseCategoryOptions, useUpdateExpense } from "../lib/expenses.hooks";
import { EXPENSE_PAYMENT_METHODS, EXPENSE_PAYMENT_METHOD_LABELS } from "../lib/expenses.constants";
import {
  EXPENSE_FORM_FIELDS,
  expenseFormDefaults,
  expenseFormSchema,
  expenseToForm,
  toCreateExpenseInput,
  toUpdateExpenseInput,
  type ExpenseForm,
} from "../lib/expenses.schema";
import type { ExpenseRow } from "../lib/expenses.types";

const FORM_ID = "expense-form";

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = EXPENSE_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: EXPENSE_PAYMENT_METHOD_LABELS[method],
}));

/**
 * Diálogo de gasto. Sin `expense` es "Nuevo gasto" (POST); con `expense` es
 * "Editar gasto" (PATCH, solo permitido en estado `pending`). Controlado por
 * el padre. El gasto siempre nace con `status: "pending"` — requiere revisión
 * para afectar la caja.
 */
export function ExpenseFormDialog({
  open,
  expense = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Gasto a editar. `null`/ausente => modo alta. */
  expense?: ExpenseRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = expense !== null;
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const categoryOptions = useExpenseCategoryOptions(open);

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expenseFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "expense");

  useEffect(() => {
    if (open) reset(expense ? expenseToForm(expense) : expenseFormDefaults);
  }, [open, expense, reset]);

  const selectedCategory: ComboboxOption | null =
    expense?.expense_category_id && expense.category_name
      ? { value: expense.expense_category_id, label: expense.category_name }
      : null;

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ExpenseForm, ExpenseRow>({
      form,
      fields: EXPENSE_FORM_FIELDS,
      submit: (values) =>
        expense
          ? updateExpense.mutateAsync({ id: expense.id, input: toUpdateExpenseInput(values) })
          : createExpense.mutateAsync(toCreateExpenseInput(values)),
      successMessage: () => `Gasto ${isEdit ? "actualizado" : "registrado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el gasto."
        : "No se pudo registrar el gasto.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar gasto" : "Registrar gasto"}
      description={
        isEdit
          ? "Solo se pueden editar gastos pendientes de revisión."
          : "El gasto se registra como pendiente hasta que se apruebe o rechace."
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
            {isSubmitting
              ? isEdit
                ? "Guardando…"
                : "Registrando…"
              : isEdit
                ? "Guardar cambios"
                : "Registrar gasto"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Categoría"
          htmlFor="expense-category"
          error={errors.expense_category_id?.message}
        >
          <Controller
            control={control}
            name="expense_category_id"
            render={({ field }) => (
              <AsyncCombobox
                id="expense-category"
                value={field.value}
                onValueChange={field.onChange}
                source={categoryOptions}
                selectedOption={selectedCategory}
                placeholder="Selecciona una categoría"
                searchPlaceholder="Buscar categoría…"
                emptyText="Sin categorías activas."
                aria-invalid={errors.expense_category_id ? true : undefined}
              />
            )}
          />
        </Field>

        <TextField
          {...bind("description")}
          label="Descripción"
          placeholder="Guantes de limpieza x 5 pares"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("amount")}
            label="Monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="85.00"
          />
          <DateField form={form} name="date" idPrefix="expense" label="Fecha del gasto" />
        </div>

        <Field
          label="Método de pago"
          htmlFor="expense-payment-method"
          error={errors.payment_method?.message}
        >
          <Controller
            control={control}
            name="payment_method"
            render={({ field }) => (
              <Combobox
                id="expense-payment-method"
                value={field.value}
                onValueChange={field.onChange}
                options={PAYMENT_METHOD_OPTIONS}
                aria-invalid={errors.payment_method ? true : undefined}
              />
            )}
          />
        </Field>

        <TextField
          {...bind("reference_number")}
          label="Nº de comprobante"
          hint="Opcional. Factura, boleta…"
          placeholder="FAC-001234"
        />

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Observaciones del gasto…"
        />
      </form>
    </AppDialog>
  );
}
