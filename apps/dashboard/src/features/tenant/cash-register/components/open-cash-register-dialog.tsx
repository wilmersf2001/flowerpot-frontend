"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, TextareaField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useOpenCashRegister } from "../lib/cash-register.hooks";
import {
  OPEN_CASH_REGISTER_FORM_FIELDS,
  openCashRegisterFormDefaults,
  openCashRegisterFormSchema,
  toOpenCashRegisterInput,
  type OpenCashRegisterForm,
} from "../lib/cash-register.schema";
import type { CashRegisterRow } from "../lib/cash-register.types";

const FORM_ID = "open-cash-register-form";

/** Diálogo de apertura de caja (`POST /cash-register/open`) para la sede activa. */
export function OpenCashRegisterDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const openCashRegister = useOpenCashRegister();

  const form = useForm<OpenCashRegisterForm>({
    resolver: zodResolver(openCashRegisterFormSchema),
    defaultValues: openCashRegisterFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "open-cash-register");

  useEffect(() => {
    if (open) reset(openCashRegisterFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<OpenCashRegisterForm, CashRegisterRow>({
      form,
      fields: OPEN_CASH_REGISTER_FORM_FIELDS,
      submit: (values) => openCashRegister.mutateAsync(toOpenCashRegisterInput(values)),
      successMessage: () => "Caja abierta.",
      errorMessage: "No se pudo abrir la caja.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-md"
      title="Abrir caja"
      description="Registra el monto inicial en efectivo con el que arranca el turno."
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
            {isSubmitting ? "Abriendo…" : "Abrir caja"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          {...bind("opening_amount")}
          label="Monto de apertura"
          type="number"
          step="0.01"
          min="0"
          placeholder="1000.00"
          autoFocus
        />
        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Apertura sede principal…"
        />
      </form>
    </AppDialog>
  );
}
