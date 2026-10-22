"use client";

import { useEffect, useMemo } from "react";
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
import { useBranchOptions, useCreateLead, useUpdateLead } from "../lib/leads.hooks";
import { LEAD_INTERESTS, LEAD_INTEREST_LABELS } from "../lib/leads.constants";
import {
  LEAD_FORM_FIELDS,
  leadFormDefaults,
  leadFormSchema,
  leadToForm,
  toCreateLeadInput,
  toUpdateLeadInput,
  type LeadForm,
} from "../lib/leads.schema";
import type { LeadRow } from "../lib/leads.types";

const FORM_ID = "lead-form";

const CONSENT_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Sin preguntar" },
  { value: "true", label: "Acepta ser contactado" },
  { value: "false", label: "No quiere ser contactado" },
];

const INTEREST_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Sin especificar" },
  ...LEAD_INTERESTS.map((interest) => ({ value: interest, label: LEAD_INTEREST_LABELS[interest] })),
];

/** Diálogo de lead: sin `lead` es alta manual (POST); con `lead`, edición (PATCH). */
export function LeadFormDialog({
  open,
  lead = null,
  onOpenChangeAction,
}: {
  open: boolean;
  lead?: LeadRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = lead !== null;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const branchOptions = useBranchOptions(open);

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "lead");

  useEffect(() => {
    if (open) reset(lead ? leadToForm(lead) : leadFormDefaults);
  }, [open, lead, reset]);

  const selectedBranch: ComboboxOption | null = useMemo(
    () => (lead?.branch ? { value: String(lead.branch.id), label: lead.branch.name } : null),
    [lead],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<LeadForm, LeadRow>({
      form,
      fields: LEAD_FORM_FIELDS,
      submit: (values) =>
        lead
          ? updateLead.mutateAsync({ id: lead.id, input: toUpdateLeadInput(values) })
          : createLead.mutateAsync(toCreateLeadInput(values)),
      successMessage: (values) => `Lead "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit ? "No se pudo actualizar el lead." : "No se pudo crear el lead.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar lead" : "Nuevo lead"}
      description={
        isEdit ? "Actualiza los datos del lead." : "Registra a una persona interesada en hacerse socia."
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
            {isSubmitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear lead"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("name")} label="Nombre" placeholder="María Pérez" autoFocus />
          <TextField {...bind("phone")} label="Teléfono" placeholder="987 654 321" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("email")} label="Correo" type="email" placeholder="maria@correo.com" />
          <TextField {...bind("dni")} label="DNI" placeholder="12345678" hint="Opcional." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DateField
            form={form}
            name="birth_date"
            idPrefix="lead"
            label="Fecha de nacimiento"
            hint="Opcional."
            toDate={new Date()}
          />
          <Field label="Consentimiento" htmlFor="lead-contact-consent" error={errors.contact_consent?.message}>
            <Controller
              control={control}
              name="contact_consent"
              render={({ field }) => (
                <Combobox
                  id="lead-contact-consent"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CONSENT_OPTIONS}
                />
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("source_detail")}
            label="Origen"
            placeholder="Instagram, Referido…"
            hint="Opcional."
          />
          <Field label="Interés" htmlFor="lead-interest" error={errors.interest?.message}>
            <Controller
              control={control}
              name="interest"
              render={({ field }) => (
                <Combobox
                  id="lead-interest"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={INTEREST_OPTIONS}
                />
              )}
            />
          </Field>
        </div>

        <Field label="Sede de interés" htmlFor="lead-branch" error={errors.branch_id?.message}>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <AsyncCombobox
                id="lead-branch"
                value={field.value}
                onValueChange={field.onChange}
                source={branchOptions}
                selectedOption={selectedBranch}
                placeholder="Sin sede"
                searchPlaceholder="Buscar sede…"
                emptyText="Sin sedes."
              />
            )}
          />
        </Field>

        <TextareaField {...bind("notes")} label="Notas" placeholder="Pidió info del plan mensual" />
      </form>
    </AppDialog>
  );
}
