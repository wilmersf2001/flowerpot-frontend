"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, formatMoney, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useRefundVisit } from "../lib/walk-in-visits.hooks";
import { refundFormSchema } from "../lib/walk-in-visits.schema";
import type { WalkInVisitRow } from "../lib/walk-in-visits.types";

type RefundForm = { reason: string };

const FORM_ID = "refund-visit-form";

/** Devolución de un pase de día: el dinero sale de caja con el método original. */
export function RefundVisitDialog({
  visit,
  onOpenChangeAction,
}: {
  visit: WalkInVisitRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const refundVisit = useRefundVisit();
  const form = useForm<RefundForm>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: { reason: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "refund-visit");

  useEffect(() => {
    if (visit) reset({ reason: "" });
  }, [visit, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<RefundForm, void>({
      form,
      fields: ["reason"],
      submit: (values) => refundVisit.mutateAsync({ id: visit!.id, reason: values.reason }),
      successMessage: () => "Pase de día devuelto.",
      errorMessage: "No se pudo devolver el pase de día.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={visit !== null}
      onOpenChange={onOpenChangeAction}
      title="Devolver pase de día"
      description={`Se devolverán ${visit ? formatMoney(visit.amount) : ""} y saldrán de caja con el método original.`}
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
            {isSubmitting ? "Devolviendo…" : "Devolver"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <TextField {...bind("reason")} label="Motivo" placeholder="El cliente se arrepintió" autoFocus />
      </form>
    </AppDialog>
  );
}
