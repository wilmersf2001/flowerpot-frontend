"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useVoidExpense } from "../lib/expenses.hooks";
import {
  EXPENSE_VOID_FORM_FIELDS,
  expenseVoidFormDefaults,
  expenseVoidFormSchema,
  toVoidExpenseInput,
  type ExpenseVoidForm,
} from "../lib/expenses.schema";
import type { ExpenseRow } from "../lib/expenses.types";

const FORM_ID = "expense-void-form";

/**
 * Diálogo de anulación (`POST /expenses/{id}/void`). Si el gasto ya tenía un
 * movimiento de caja automático (aprobado en efectivo), el backend lo revierte
 * aunque la caja esté cerrada. El padre pasa el gasto a anular (o `null` para
 * cerrar). Solo aplica a gastos `pending`/`approved` (no `rejected`).
 */
export function VoidExpenseDialog({
  expense,
  onOpenChangeAction,
}: {
  expense: ExpenseRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const voidExpense = useVoidExpense();
  const open = expense !== null;

  const form = useForm<ExpenseVoidForm>({
    resolver: zodResolver(expenseVoidFormSchema),
    defaultValues: expenseVoidFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "expense-void");

  useEffect(() => {
    if (open) reset(expenseVoidFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ExpenseVoidForm, ExpenseRow>({
      form,
      fields: EXPENSE_VOID_FORM_FIELDS,
      submit: (values) => {
        if (!expense) throw new Error("No hay gasto seleccionado.");
        return voidExpense.mutateAsync({ id: expense.id, input: toVoidExpenseInput(values) });
      },
      successMessage: () => "Gasto anulado.",
      errorMessage: "No se pudo anular el gasto.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={`Anular "${expense?.description ?? ""}"`}
      description="Si el gasto afectó la caja, el movimiento se revertirá. Esta acción no se puede deshacer."
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
          <Button type="submit" form={FORM_ID} variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Anulando…" : "Anular gasto"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextareaField
          {...bind("void_reason")}
          label="Motivo de anulación"
          placeholder="Compra duplicada, se registró dos veces por error…"
          autoFocus
        />
      </form>
    </AppDialog>
  );
}
