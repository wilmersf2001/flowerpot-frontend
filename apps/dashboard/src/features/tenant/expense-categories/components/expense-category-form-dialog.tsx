"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreateExpenseCategory, useUpdateExpenseCategory } from "../lib/expense-categories.hooks";
import {
  EXPENSE_CATEGORY_FORM_FIELDS,
  expenseCategoryFormDefaults,
  expenseCategoryFormSchema,
  expenseCategoryToForm,
  toCreateExpenseCategoryInput,
  toUpdateExpenseCategoryInput,
  type ExpenseCategoryForm,
} from "../lib/expense-categories.schema";
import type { ExpenseCategoryRow } from "../lib/expense-categories.types";

const FORM_ID = "expense-category-form";

/**
 * Diálogo de categoría de gasto. Sin `category` es "Nueva categoría" (POST);
 * con `category` es "Editar categoría" (PATCH). Controlado por el padre.
 */
export function ExpenseCategoryFormDialog({
  open,
  category = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Categoría a editar. `null`/ausente => modo alta. */
  category?: ExpenseCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = category !== null;
  const createCategory = useCreateExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();

  const form = useForm<ExpenseCategoryForm>({
    resolver: zodResolver(expenseCategoryFormSchema),
    defaultValues: expenseCategoryFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "expense-category");

  useEffect(() => {
    if (open) reset(category ? expenseCategoryToForm(category) : expenseCategoryFormDefaults);
  }, [open, category, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ExpenseCategoryForm, ExpenseCategoryRow>({
      form,
      fields: EXPENSE_CATEGORY_FORM_FIELDS,
      submit: (values) =>
        category
          ? updateCategory.mutateAsync({
              id: category.id,
              input: toUpdateExpenseCategoryInput(values),
            })
          : createCategory.mutateAsync(toCreateExpenseCategoryInput(values)),
      successMessage: (values) =>
        `Categoría "${values.name}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la categoría."
        : "No se pudo crear la categoría.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar categoría" : "Nueva categoría"}
      description={
        isEdit
          ? "Actualiza los datos de la categoría de gasto."
          : "Crea una categoría para clasificar los gastos del negocio."
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
                : "Creando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear categoría"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Limpieza" autoFocus />
        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Productos y servicios de limpieza…"
        />
      </form>
    </AppDialog>
  );
}
