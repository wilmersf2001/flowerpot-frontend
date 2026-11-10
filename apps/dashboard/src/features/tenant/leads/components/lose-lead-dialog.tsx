"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { AppDialog, Field, useResourceFormSubmit } from "@/features/_shared";
import { LEAD_LOST_REASONS, LEAD_LOST_REASON_LABELS } from "../lib/leads.constants";
import { useLoseLead } from "../lib/leads.hooks";
import {
  LOSE_LEAD_FORM_FIELDS,
  loseLeadFormSchema,
  toLoseLeadInput,
  type LoseLeadForm,
} from "../lib/leads.schema";
import type { LeadRow } from "../lib/leads.types";

const FORM_ID = "lose-lead-form";

const REASON_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Selecciona un motivo" },
  ...LEAD_LOST_REASONS.map((reason) => ({ value: reason, label: LEAD_LOST_REASON_LABELS[reason] })),
];

/** Marca un lead como perdido (`PATCH /leads/{id}/lose`) pidiendo el motivo. */
export function LoseLeadDialog({
  lead,
  onOpenChangeAction,
}: {
  lead: LeadRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const loseLead = useLoseLead();

  const form = useForm<LoseLeadForm>({
    resolver: zodResolver(loseLeadFormSchema),
    // Vacío al abrir: obliga a elegir un motivo (la validación lo exige).
    defaultValues: { lost_reason: "" as LoseLeadForm["lost_reason"] },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (lead) reset({ lost_reason: "" as LoseLeadForm["lost_reason"] });
  }, [lead, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<LoseLeadForm, LeadRow>({
      form,
      fields: LOSE_LEAD_FORM_FIELDS,
      submit: (values) => loseLead.mutateAsync({ id: lead!.id, input: toLoseLeadInput(values) }),
      successMessage: () => `"${lead?.name}" marcado como perdido.`,
      errorMessage: "No se pudo marcar el lead como perdido.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={lead !== null}
      onOpenChange={onOpenChangeAction}
      title="Marcar como perdido"
      description={lead ? `Indica por qué se perdió a ${lead.name}.` : undefined}
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
            {isSubmitting ? "Guardando…" : "Marcar perdido"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <Field
          label="¿Por qué se perdió este prospecto?"
          htmlFor="lose-lead-reason"
          error={errors.lost_reason?.message}
        >
          <Controller
            control={control}
            name="lost_reason"
            render={({ field }) => (
              <Combobox
                id="lose-lead-reason"
                value={field.value}
                onValueChange={field.onChange}
                options={REASON_OPTIONS}
                aria-invalid={errors.lost_reason ? true : undefined}
              />
            )}
          />
        </Field>
      </form>
    </AppDialog>
  );
}
