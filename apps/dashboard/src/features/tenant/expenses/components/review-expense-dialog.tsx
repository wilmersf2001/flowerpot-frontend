"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useReviewExpense } from "../lib/expenses.hooks";
import {
  EXPENSE_REVIEW_FORM_FIELDS,
  expenseReviewFormSchema,
  toReviewExpenseInput,
  type ExpenseReviewForm,
} from "../lib/expenses.schema";
import type { ExpenseRow } from "../lib/expenses.types";

const FORM_ID = "expense-review-form";

/**
 * Diálogo de aprobación/rechazo (`POST /expenses/{id}/review`). Si se
 * aprueba un gasto en efectivo, el backend descuenta la caja abierta de la
 * sede automáticamente. El padre pasa el gasto + la acción elegida (o `null`
 * para cerrar).
 */
export function ReviewExpenseDialog({
  expense,
  action,
  onOpenChangeAction,
}: {
  expense: ExpenseRow | null;
  action: "approve" | "reject";
  onOpenChangeAction: (open: boolean) => void;
}) {
  const reviewExpense = useReviewExpense();
  const open = expense !== null;
  const isApprove = action === "approve";

  const form = useForm<ExpenseReviewForm>({
    resolver: zodResolver(expenseReviewFormSchema),
    defaultValues: { action, notes: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "expense-review");

  useEffect(() => {
    if (open) reset({ action, notes: "" });
  }, [open, action, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ExpenseReviewForm, ExpenseRow>({
      form,
      fields: EXPENSE_REVIEW_FORM_FIELDS,
      submit: (values) => {
        if (!expense) throw new Error("No hay gasto seleccionado.");
        return reviewExpense.mutateAsync({ id: expense.id, input: toReviewExpenseInput(values) });
      },
      successMessage: () => (isApprove ? "Gasto aprobado." : "Gasto rechazado."),
      errorMessage: isApprove
        ? "No se pudo aprobar el gasto."
        : "No se pudo rechazar el gasto.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isApprove ? "Aprobar gasto" : "Rechazar gasto"}
      description={
        expense
          ? isApprove
            ? `¿Aprobar "${expense.description}"? ${
                expense.payment_method === "cash"
                  ? "Se descontará automáticamente de la caja abierta."
                  : "No afecta la caja física."
              }`
            : `¿Rechazar "${expense.description}"? Debes indicar el motivo.`
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
          <Button
            type="submit"
            form={FORM_ID}
            variant={isApprove ? "default" : "destructive"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando…" : isApprove ? "Aprobar" : "Rechazar"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint={isApprove ? "Opcional." : "Obligatorio: indica el motivo del rechazo."}
          placeholder={isApprove ? "Aprobado, precio razonable…" : "Precio muy elevado…"}
        />
      </form>
    </AppDialog>
  );
}
