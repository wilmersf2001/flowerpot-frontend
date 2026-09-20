"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  Field,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { usePlanOptions } from "@/features/central/plans";
import { useRenewSubscription } from "../lib/subscriptions.hooks";
import {
  RENEW_SUBSCRIPTION_FORM_FIELDS,
  renewSubscriptionFormDefaults,
  renewSubscriptionFormSchema,
  toRenewSubscriptionInput,
  type RenewSubscriptionForm,
} from "../lib/subscriptions.schema";
import type { SubscriptionRow } from "../lib/subscriptions.types";

const FORM_ID = "subscription-renew-form";

/**
 * Diálogo de renovación: `POST /subscriptions/{id}/renew`. El plan es
 * opcional (por defecto se repite el actual); las notas también.
 */
export function RenewSubscriptionDialog({
  open,
  subscription,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Suscripción a renovar. `null` cuando el diálogo está cerrado. */
  subscription: SubscriptionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const renewSubscription = useRenewSubscription();
  const planOptions = usePlanOptions();

  // El plan actual se muestra como referencia, pero no se preselecciona:
  // dejar el campo vacío significa "repetir el plan actual" para el backend.
  const currentPlanOption: ComboboxOption | null = subscription
    ? {
        value: String(subscription.plan_id),
        label: subscription.plan_name,
        hint: subscription.plan_price_formatted || undefined,
      }
    : null;

  const form = useForm<RenewSubscriptionForm>({
    resolver: zodResolver(renewSubscriptionFormSchema),
    defaultValues: renewSubscriptionFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "subscription-renew");

  useEffect(() => {
    if (open) reset(renewSubscriptionFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<RenewSubscriptionForm, unknown>({
      form,
      fields: RENEW_SUBSCRIPTION_FORM_FIELDS,
      submit: (values) =>
        renewSubscription.mutateAsync({
          id: subscription!.id,
          input: toRenewSubscriptionInput(values),
        }),
      successMessage: () =>
        `Suscripción de "${subscription?.tenant_id}" renovada.`,
      errorMessage: "No se pudo renovar la suscripción.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Renovar suscripción"
      description={
        subscription
          ? `Extiende la vigencia de "${subscription.tenant_id}".`
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
            disabled={isSubmitting || !subscription}
          >
            {isSubmitting ? "Renovando…" : "Renovar"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <Field
          label="Plan"
          htmlFor="subscription-renew-plan"
          error={errors.plan_id?.message}
          hint={`Opcional. Sin elegir uno, se repite "${subscription?.plan_name ?? "el plan actual"}".`}
        >
          <Controller
            control={control}
            name="plan_id"
            render={({ field }) => (
              <AsyncCombobox
                id="subscription-renew-plan"
                value={field.value}
                onValueChange={field.onChange}
                source={planOptions}
                selectedOption={currentPlanOption}
                placeholder="Mismo plan actual"
                searchPlaceholder="Buscar plan…"
                emptyText="Sin planes."
                aria-invalid={errors.plan_id ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Motivo de la renovación, acuerdo, contacto…"
        />
      </form>
    </AppDialog>
  );
}
