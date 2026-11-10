"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  DateField,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useConvertLead } from "../lib/leads.hooks";
import {
  CONVERT_LEAD_FORM_FIELDS,
  convertLeadFormSchema,
  leadToConvertForm,
  toConvertLeadInput,
  type ConvertLeadForm,
} from "../lib/leads.schema";
import type { LeadRow } from "../lib/leads.types";

const FORM_ID = "convert-lead-form";

/** Convierte un lead en socio (`POST /leads/{id}/convert`), prellenando sus datos. */
export function ConvertLeadDialog({
  lead,
  onOpenChangeAction,
}: {
  lead: LeadRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const convertLead = useConvertLead();

  const form = useForm<ConvertLeadForm>({
    resolver: zodResolver(convertLeadFormSchema),
    defaultValues: lead ? leadToConvertForm(lead) : undefined,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "convert-lead");

  useEffect(() => {
    if (lead) reset(leadToConvertForm(lead));
  }, [lead, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ConvertLeadForm, LeadRow>({
      form,
      fields: CONVERT_LEAD_FORM_FIELDS,
      submit: (values) =>
        convertLead.mutateAsync({
          id: lead!.id,
          input: { ...toConvertLeadInput(values), branch_id: lead?.branch?.id ?? null },
        }),
      successMessage: (values) => `${values.first_name} ${values.last_name} ya es socio.`,
      errorMessage: "No se pudo convertir el lead en socio.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={lead !== null}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Convertir en socio"
      description="Revisa los datos antes de crear al socio. El historial de visitas del lead se conserva."
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
            {isSubmitting ? "Convirtiendo…" : "Convertir en socio"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("first_name")} label="Nombres" autoFocus />
          <TextField {...bind("last_name")} label="Apellidos" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("dni")} label="DNI" placeholder="12345678" />
          <TextField {...bind("phone")} label="Teléfono" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("email")} label="Correo" type="email" />
          <DateField
            form={form}
            name="birth_date"
            idPrefix="convert-lead"
            label="Fecha de nacimiento"
            toDate={new Date()}
          />
        </div>
      </form>
    </AppDialog>
  );
}
