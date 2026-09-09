"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { usePlanOptions } from "@/features/plans";
import { useTenantOptions } from "@/features/tenants";
import {
  useCreateSubscription,
  useUpdateSubscription,
} from "../lib/subscriptions.hooks";
import {
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_LABELS,
} from "../lib/subscriptions.constants";
import {
  SUBSCRIPTION_FORM_FIELDS,
  subscriptionFormDefaults,
  subscriptionFormSchema,
  subscriptionToForm,
  toCreateSubscriptionInput,
  toUpdateSubscriptionInput,
  type SubscriptionForm,
} from "../lib/subscriptions.schema";
import type { SubscriptionRow } from "../lib/subscriptions.types";

const FORM_ID = "subscription-form";

/** Estados: lista fija -> `Combobox` sin buscador. */
const STATUS_OPTIONS: ComboboxOption[] = SUBSCRIPTION_STATUSES.map((status) => ({
  value: status,
  label: SUBSCRIPTION_STATUS_LABELS[status],
}));

/**
 * Diálogo de suscripción. Sin `subscription` es "Nueva suscripción" (POST);
 * con `subscription` es "Editar suscripción" (PUT). Controlado por el padre.
 */
export function SubscriptionFormDialog({
  open,
  subscription = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Suscripción a editar. `null`/ausente => modo alta. */
  subscription?: SubscriptionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = subscription !== null;
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();

  // Selects asíncronos: buscan y paginan por scroll contra el `list()` del
  // modelo. El de gimnasio solo se usa en alta (en edición es de solo lectura).
  const tenantOptions = useTenantOptions(!isEdit);
  const planOptions = usePlanOptions();

  // Modo edición: el plan contratado puede no venir en la 1ª página de
  // resultados, así que damos su etiqueta a mano desde la fila.
  const selectedPlanOption: ComboboxOption | null = subscription
    ? {
        value: String(subscription.plan_id),
        label: subscription.plan_name,
        hint: subscription.plan_price_formatted || undefined,
      }
    : null;

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: subscriptionFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "subscription");

  // Cada vez que se abre, sincroniza con la suscripción (edición) o limpia.
  useEffect(() => {
    if (open) {
      reset(
        subscription
          ? subscriptionToForm(subscription)
          : subscriptionFormDefaults,
      );
    }
  }, [open, subscription, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<SubscriptionForm, unknown>({
      form,
      fields: SUBSCRIPTION_FORM_FIELDS,
      submit: (values) =>
        subscription
          ? updateSubscription.mutateAsync({
              id: subscription.id,
              input: toUpdateSubscriptionInput(values),
            })
          : createSubscription.mutateAsync(toCreateSubscriptionInput(values)),
      successMessage: (values) =>
        `Suscripción de "${values.tenant_id}" ${
          isEdit ? "actualizada" : "creada"
        }.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la suscripción."
        : "No se pudo crear la suscripción.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar suscripción" : "Nueva suscripción"}
      description={
        isEdit
          ? "El gimnasio no se puede cambiar. Ajusta el plan, la vigencia o el estado."
          : "Asigna un plan a un gimnasio y define su vigencia."
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
            {isSubmitting
              ? isEdit
                ? "Guardando…"
                : "Creando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear suscripción"}
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
        {isEdit ? (
          <TextField
            {...bind("tenant_id")}
            label="Gimnasio"
            readOnly
            hint="No se puede cambiar."
          />
        ) : (
          <Field
            label="Gimnasio"
            htmlFor="subscription-tenant"
            error={errors.tenant_id?.message}
          >
            <Controller
              control={control}
              name="tenant_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="subscription-tenant"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={tenantOptions}
                  placeholder="Selecciona un gimnasio"
                  searchPlaceholder="Buscar gimnasio…"
                  emptyText="Sin gimnasios."
                  aria-invalid={errors.tenant_id ? true : undefined}
                />
              )}
            />
          </Field>
        )}

        <Field
          label="Plan"
          htmlFor="subscription-plan"
          error={errors.plan_id?.message}
        >
          <Controller
            control={control}
            name="plan_id"
            render={({ field }) => (
              <AsyncCombobox
                id="subscription-plan"
                value={field.value}
                onValueChange={field.onChange}
                source={planOptions}
                selectedOption={selectedPlanOption}
                placeholder="Selecciona un plan"
                searchPlaceholder="Buscar plan…"
                emptyText="Sin planes."
                aria-invalid={errors.plan_id ? true : undefined}
              />
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("starts_at")} label="Inicio" type="date" />
          <TextField {...bind("ends_at")} label="Fin" type="date" />
        </div>

        <Field
          label="Estado"
          htmlFor="subscription-status"
          error={errors.status?.message}
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox
                id="subscription-status"
                value={field.value}
                onValueChange={field.onChange}
                options={STATUS_OPTIONS}
                aria-invalid={errors.status ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Acuerdo comercial, descuentos, contacto…"
        />
      </form>
    </AppDialog>
  );
}
