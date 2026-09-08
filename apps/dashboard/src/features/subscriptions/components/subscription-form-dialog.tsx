"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { AppDialog } from "@/features/_shared";
import { usePlans } from "@/features/plans";
import { useTenants } from "@/features/tenants";
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
const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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

  // Opciones de los selects. Traemos una página grande: el alta de una
  // suscripción es puntual y el número de gimnasios/planes es acotado.
  const tenants = useTenants({ perPage: 100 });
  const plans = usePlans({ perPage: 100 });
  const tenantRows = tenants.data?.data ?? [];
  const planRows = plans.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: subscriptionFormDefaults,
  });

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (subscription) {
        await updateSubscription.mutateAsync({
          id: subscription.id,
          input: toUpdateSubscriptionInput(values),
        });
        toast.success(`Suscripción de "${values.tenant_id}" actualizada.`);
        onOpenChangeAction(false);
        return;
      }

      await createSubscription.mutateAsync(toCreateSubscriptionInput(values));
      toast.success(`Suscripción de "${values.tenant_id}" creada.`);
      onOpenChangeAction(false);
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          if (
            (SUBSCRIPTION_FORM_FIELDS as readonly string[]).includes(field) &&
            messages?.[0]
          ) {
            setError(field as keyof SubscriptionForm, { message: messages[0] });
          }
        }
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "No se pudo actualizar la suscripción."
            : "No se pudo crear la suscripción.";
      toast.error(message);
    }
  });

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
        <Field
          label="Gimnasio"
          htmlFor="subscription-tenant"
          error={errors.tenant_id?.message}
          hint={isEdit ? "No se puede cambiar." : undefined}
        >
          {isEdit ? (
            <Input
              id="subscription-tenant"
              readOnly
              className="text-muted-foreground"
              {...register("tenant_id")}
            />
          ) : (
            <select
              id="subscription-tenant"
              className={SELECT_CLASS}
              disabled={tenants.isPending}
              aria-invalid={errors.tenant_id ? true : undefined}
              {...register("tenant_id")}
            >
              <option value="">
                {tenants.isPending ? "Cargando…" : "Selecciona un gimnasio"}
              </option>
              {tenantRows.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.id}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          label="Plan"
          htmlFor="subscription-plan"
          error={errors.plan_id?.message}
        >
          <select
            id="subscription-plan"
            className={SELECT_CLASS}
            disabled={plans.isPending}
            aria-invalid={errors.plan_id ? true : undefined}
            {...register("plan_id")}
          >
            <option value="">
              {plans.isPending ? "Cargando…" : "Selecciona un plan"}
            </option>
            {planRows.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
                {plan.price_formatted ? ` · ${plan.price_formatted}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Inicio"
            htmlFor="subscription-starts-at"
            error={errors.starts_at?.message}
          >
            <Input
              id="subscription-starts-at"
              type="date"
              aria-invalid={errors.starts_at ? true : undefined}
              {...register("starts_at")}
            />
          </Field>

          <Field
            label="Fin"
            htmlFor="subscription-ends-at"
            error={errors.ends_at?.message}
          >
            <Input
              id="subscription-ends-at"
              type="date"
              aria-invalid={errors.ends_at ? true : undefined}
              {...register("ends_at")}
            />
          </Field>
        </div>

        <Field
          label="Estado"
          htmlFor="subscription-status"
          error={errors.status?.message}
        >
          <select
            id="subscription-status"
            className={SELECT_CLASS}
            aria-invalid={errors.status ? true : undefined}
            {...register("status")}
          >
            {SUBSCRIPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {SUBSCRIPTION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Notas"
          htmlFor="subscription-notes"
          error={errors.notes?.message}
          hint="Opcional."
        >
          <textarea
            id="subscription-notes"
            rows={3}
            placeholder="Acuerdo comercial, descuentos, contacto…"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("notes")}
          />
        </Field>
      </form>
    </AppDialog>
  );
}

/** Campo del formulario: etiqueta + control + error/pista. */
function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
