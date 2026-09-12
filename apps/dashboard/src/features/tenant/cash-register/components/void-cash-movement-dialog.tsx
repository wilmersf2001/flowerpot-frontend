"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useVoidCashMovement } from "../lib/cash-register.hooks";
import {
  VOID_CASH_MOVEMENT_FORM_FIELDS,
  voidCashMovementFormDefaults,
  voidCashMovementFormSchema,
  toVoidCashMovementInput,
  type VoidCashMovementForm,
} from "../lib/cash-register.schema";
import type { CashMovementRow } from "../lib/cash-register.types";

const FORM_ID = "void-cash-movement-form";

/**
 * Diálogo de anulación de movimiento (`DELETE /cash-movements/{id}`). Anular
 * un movimiento de una caja cerrada requiere `cash_register.view_history`
 * (lo valida el backend); el padre pasa el movimiento a anular (o `null`).
 */
export function VoidCashMovementDialog({
  movement,
  onOpenChangeAction,
}: {
  movement: CashMovementRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const voidMovement = useVoidCashMovement();
  const open = movement !== null;

  const form = useForm<VoidCashMovementForm>({
    resolver: zodResolver(voidCashMovementFormSchema),
    defaultValues: voidCashMovementFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "void-cash-movement");

  useEffect(() => {
    if (open) reset(voidCashMovementFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<VoidCashMovementForm, CashMovementRow>({
      form,
      fields: VOID_CASH_MOVEMENT_FORM_FIELDS,
      submit: (values) => {
        if (!movement) throw new Error("No hay movimiento seleccionado.");
        return voidMovement.mutateAsync({ id: movement.id, input: toVoidCashMovementInput(values) });
      },
      successMessage: () => "Movimiento anulado.",
      errorMessage: "No se pudo anular el movimiento.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={`Anular "${movement?.description ?? ""}"`}
      description="El movimiento se marcará como anulado y se revertirá el balance de la caja. Esta acción no se puede deshacer."
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
            {isSubmitting ? "Anulando…" : "Anular movimiento"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextareaField
          {...bind("void_reason")}
          label="Motivo de anulación"
          placeholder="Error en registro, monto incorrecto…"
          autoFocus
        />
      </form>
    </AppDialog>
  );
}
