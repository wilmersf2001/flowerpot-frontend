"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCloseCashRegister } from "../lib/cash-register.hooks";
import { formatSoles } from "../lib/cash-register.constants";
import {
  CLOSE_CASH_REGISTER_FORM_FIELDS,
  closeCashRegisterFormDefaults,
  closeCashRegisterFormSchema,
  toCloseCashRegisterInput,
  type CloseCashRegisterForm,
} from "../lib/cash-register.schema";
import type { CashRegisterRow } from "../lib/cash-register.types";

const FORM_ID = "close-cash-register-form";

/**
 * Diálogo de cierre de caja (`POST /cash-register/close`). El backend calcula
 * `difference = closing_amount - current_balance` (sobrante/faltante); el
 * padre pasa la caja abierta a cerrar (o `null` para cerrar el diálogo).
 */
export function CloseCashRegisterDialog({
  register,
  onOpenChangeAction,
}: {
  register: CashRegisterRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const closeCashRegister = useCloseCashRegister();
  const open = register !== null;

  const form = useForm<CloseCashRegisterForm>({
    resolver: zodResolver(closeCashRegisterFormSchema),
    defaultValues: closeCashRegisterFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "close-cash-register");

  useEffect(() => {
    if (open) reset(closeCashRegisterFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<CloseCashRegisterForm, CashRegisterRow>({
      form,
      fields: CLOSE_CASH_REGISTER_FORM_FIELDS,
      submit: (values) => closeCashRegister.mutateAsync(toCloseCashRegisterInput(values)),
      successMessage: () => "Caja cerrada.",
      errorMessage: "No se pudo cerrar la caja.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-md"
      title="Cerrar caja"
      description={
        register
          ? `Balance en sistema: ${formatSoles(register.current_balance)}. Ingresa el conteo físico de efectivo.`
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
            {isSubmitting ? "Cerrando…" : "Cerrar caja"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          {...bind("closing_amount")}
          label="Conteo físico de efectivo"
          type="number"
          step="0.01"
          min="0"
          placeholder="1065.00"
          autoFocus
        />
        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Cierre sin diferencias…"
        />
      </form>
    </AppDialog>
  );
}
