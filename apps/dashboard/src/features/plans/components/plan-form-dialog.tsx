"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  Field,
  TextField,
  TextareaField,
  slugify,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreatePlan, useUpdatePlan } from "../lib/plans.hooks";
import {
  PLAN_BILLING_PERIODS,
  PLAN_BILLING_PERIOD_LABELS,
} from "../lib/plans.constants";
import {
  PLAN_FORM_FIELDS,
  planFormDefaults,
  planFormSchema,
  planToForm,
  toCreatePlanInput,
  toUpdatePlanInput,
  type PlanForm,
} from "../lib/plans.schema";
import type { PlanRow } from "../lib/plans.types";

const FORM_ID = "plan-form";

/** Periodos de facturación: lista fija -> `Combobox` sin buscador. */
const BILLING_PERIOD_OPTIONS: ComboboxOption[] = PLAN_BILLING_PERIODS.map(
  (period) => ({ value: period, label: PLAN_BILLING_PERIOD_LABELS[period] }),
);

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

  const form = useForm<PlanForm>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "plan");

  // Cada vez que se abre, sincroniza con el plan (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(plan ? planToForm(plan) : planFormDefaults);
  }, [open, plan, reset]);

  // En alta el identificador se deriva del nombre; el usuario no lo edita.
  // eslint-disable-next-line react-hooks/incompatible-library
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit) setValue("slug", slugify(nameValue ?? ""));
  }, [isEdit, nameValue, setValue]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<PlanForm, PlanRow>({
      form,
      fields: PLAN_FORM_FIELDS,
      submit: (values) =>
        plan
          ? updatePlan.mutateAsync({
              id: plan.id,
              input: toUpdatePlanInput(values),
            })
          : createPlan.mutateAsync(toCreatePlanInput(values)),
      successMessage: (values) =>
        `Plan "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el plan."
        : "No se pudo crear el plan.",
      onSuccess: (result) => {
        onOpenChangeAction(false);
        // El callback solo interesa en alta (crear -> abrir credenciales).
        if (!isEdit) onCreatedAction?.(result);
      },
    }),
  );

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
        <TextField
          {...bind("name")}
          label="Nombre"
          placeholder="Plan Pro"
          autoFocus
        />

        <TextField
          {...bind("slug")}
          label="Identificador"
          placeholder="plan-pro"
          readOnly
          hint={
            isEdit
              ? "No se puede cambiar."
              : "Se genera a partir del nombre. No se puede cambiar después."
          }
        />

        <TextField
          {...bind("description")}
          label="Descripción"
          placeholder="Para gimnasios en crecimiento"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("price")}
            label="Precio"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="99.90"
          />

          <TextField
            {...bind("currency")}
            label="Moneda"
            placeholder="PEN"
            maxLength={3}
            className="uppercase"
            readOnly={isEdit}
            hint={isEdit ? "No se puede cambiar." : undefined}
          />
        </div>

        <Field
          label="Facturación"
          htmlFor="plan-billing-period"
          error={errors.billing_period?.message}
          hint={isEdit ? "No se puede cambiar." : undefined}
        >
          <Controller
            control={control}
            name="billing_period"
            render={({ field }) => (
              <Combobox
                id="plan-billing-period"
                value={field.value}
                onValueChange={field.onChange}
                options={BILLING_PERIOD_OPTIONS}
                disabled={isEdit}
                aria-invalid={errors.billing_period ? true : undefined}
              />
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("max_locations")}
            label="Máx. sedes"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            hint="0 = ilimitado"
          />

          <TextField
            {...bind("max_members")}
            label="Máx. miembros"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            hint="0 = ilimitado"
          />
        </div>

        <TextareaField
          {...bind("features")}
          label="Características"
          hint="Una por línea."
          placeholder={"Reportes avanzados\nSoporte prioritario"}
        />

        <TextField
          {...bind("sort_order")}
          label="Orden"
          type="number"
          inputMode="numeric"
          min={0}
          step="1"
          hint="Menor número aparece primero."
        />

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
