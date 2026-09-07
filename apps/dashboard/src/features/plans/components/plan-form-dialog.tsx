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
import { useCreatePlan, useUpdatePlan } from "../lib/plans.hooks";
import {
  PLAN_BILLING_PERIODS,
  PLAN_BILLING_PERIOD_LABELS,
} from "../lib/plans.constants";
import {
  planFormDefaults,
  planFormSchema,
  planToForm,
  toCreatePlanInput,
  toUpdatePlanInput,
  type PlanForm,
} from "../lib/plans.schema";
import type { PlanRow } from "../lib/plans.types";

const FORM_ID = "plan-form";

/**
 * Diálogo de plan. Sin `plan` es "Nuevo plan" (POST); con `plan` es
 * "Editar plan" (PUT). Controlado por el padre.
 */
export function PlanFormDialog({
  open,
  plan = null,
  onOpenChangeAction,
  onCreatedAction,
}: {
  open: boolean;
  /** Plan a editar. `null`/ausente => modo alta. */
  plan?: PlanRow | null;
  onOpenChangeAction: (open: boolean) => void;
  /** Solo en modo alta: se llama con el plan recién creado. */
  onCreatedAction?: (plan: PlanRow) => void;
}) {
  const isEdit = plan !== null;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PlanForm>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });

  // Cada vez que se abre, sincroniza con el plan (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(plan ? planToForm(plan) : planFormDefaults);
  }, [open, plan, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (plan) {
        await updatePlan.mutateAsync({
          id: plan.id,
          input: toUpdatePlanInput(values),
        });
        toast.success(`Plan "${values.name}" actualizado.`);
        onOpenChangeAction(false);
        return;
      }

      const created = await createPlan.mutateAsync(toCreatePlanInput(values));
      toast.success(`Plan "${values.name}" creado.`);
      onOpenChangeAction(false);
      onCreatedAction?.(created);
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          if (field in planFormDefaults && messages?.[0]) {
            setError(field as keyof PlanForm, { message: messages[0] });
          }
        }
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "No se pudo actualizar el plan."
            : "No se pudo crear el plan.";
      toast.error(message);
    }
  });

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar plan" : "Nuevo plan"}
      description={
        isEdit
          ? "El identificador, la moneda y la facturación no se pueden cambiar."
          : "Define el precio y los límites del plan comercial."
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
                : "Crear plan"}
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
        <Field label="Nombre" htmlFor="plan-name" error={errors.name?.message}>
          <Input
            id="plan-name"
            placeholder="Plan Pro"
            autoComplete="off"
            autoFocus
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
        </Field>

        <Field
          label="Identificador"
          htmlFor="plan-slug"
          error={errors.slug?.message}
          hint={
            isEdit
              ? "No se puede cambiar."
              : "Minúsculas, números y guion. No se puede cambiar después."
          }
        >
          <Input
            id="plan-slug"
            placeholder="plan-pro"
            autoComplete="off"
            readOnly={isEdit}
            aria-invalid={errors.slug ? true : undefined}
            className={isEdit ? "text-muted-foreground" : undefined}
            {...register("slug")}
          />
        </Field>

        <Field
          label="Descripción"
          htmlFor="plan-description"
          error={errors.description?.message}
        >
          <Input
            id="plan-description"
            placeholder="Para gimnasios en crecimiento"
            autoComplete="off"
            aria-invalid={errors.description ? true : undefined}
            {...register("description")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio" htmlFor="plan-price" error={errors.price?.message}>
            <Input
              id="plan-price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="99.90"
              aria-invalid={errors.price ? true : undefined}
              {...register("price")}
            />
          </Field>

          <Field
            label="Moneda"
            htmlFor="plan-currency"
            error={errors.currency?.message}
            hint={isEdit ? "No se puede cambiar." : undefined}
          >
            <Input
              id="plan-currency"
              placeholder="PEN"
              autoComplete="off"
              maxLength={3}
              readOnly={isEdit}
              className={
                isEdit ? "uppercase text-muted-foreground" : "uppercase"
              }
              aria-invalid={errors.currency ? true : undefined}
              {...register("currency")}
            />
          </Field>
        </div>

        <Field
          label="Facturación"
          htmlFor="plan-billing-period"
          error={errors.billing_period?.message}
          hint={isEdit ? "No se puede cambiar." : undefined}
        >
          <select
            id="plan-billing-period"
            disabled={isEdit}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={errors.billing_period ? true : undefined}
            {...register("billing_period")}
          >
            {PLAN_BILLING_PERIODS.map((period) => (
              <option key={period} value={period}>
                {PLAN_BILLING_PERIOD_LABELS[period]}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Máx. sedes"
            htmlFor="plan-max-locations"
            error={errors.max_locations?.message}
            hint="0 = ilimitado"
          >
            <Input
              id="plan-max-locations"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              aria-invalid={errors.max_locations ? true : undefined}
              {...register("max_locations")}
            />
          </Field>

          <Field
            label="Máx. miembros"
            htmlFor="plan-max-members"
            error={errors.max_members?.message}
            hint="0 = ilimitado"
          >
            <Input
              id="plan-max-members"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              aria-invalid={errors.max_members ? true : undefined}
              {...register("max_members")}
            />
          </Field>
        </div>

        <Field
          label="Características"
          htmlFor="plan-features"
          error={errors.features?.message}
          hint="Una por línea."
        >
          <textarea
            id="plan-features"
            rows={3}
            placeholder={"Reportes avanzados\nSoporte prioritario"}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("features")}
          />
        </Field>

        <Field
          label="Orden"
          htmlFor="plan-sort-order"
          error={errors.sort_order?.message}
          hint="Menor número aparece primero."
        >
          <Input
            id="plan-sort-order"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            aria-invalid={errors.sort_order ? true : undefined}
            {...register("sort_order")}
          />
        </Field>

        {isEdit ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-input"
              {...register("is_active")}
            />
            Plan activo (visible para asignar a gimnasios)
          </label>
        ) : null}
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
