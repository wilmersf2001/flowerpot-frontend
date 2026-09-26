"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox } from "@repo/ui/combobox";
import { Input } from "@repo/ui/input";
import {
  AppDialog,
  CURRENCY_OPTIONS,
  Field,
  MultiCombobox,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useServiceOptions } from "@/features/tenant/services";
import {
  useCreateMembershipPlan,
  useUpdateMembershipPlan,
} from "../lib/membership-plans.hooks";
import { BRANCH_ACCESS_OPTIONS } from "../lib/membership-plans.constants";
import {
  MEMBERSHIP_PLAN_FORM_FIELDS,
  membershipPlanFormDefaults,
  membershipPlanFormSchema,
  membershipPlanToForm,
  toCreateMembershipPlanInput,
  toUpdateMembershipPlanInput,
  type MembershipPlanForm,
} from "../lib/membership-plans.schema";
import type { MembershipPlanRow } from "../lib/membership-plans.types";

const FORM_ID = "membership-plan-form";

/**
 * Diálogo de plan de membresía. Sin `plan` es "Nuevo plan" (POST); con `plan`
 * es "Editar plan" (PATCH). Controlado por el padre.
 */
export function MembershipPlanFormDialog({
  open,
  plan = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Plan a editar. `null`/ausente => modo alta. */
  plan?: MembershipPlanRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = plan !== null;
  const createPlan = useCreateMembershipPlan();
  const updatePlan = useUpdateMembershipPlan();

  const form = useForm<MembershipPlanForm>({
    resolver: zodResolver(membershipPlanFormSchema),
    defaultValues: membershipPlanFormDefaults,
  });
  const {
    control,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "membership-plan");

  // Sedes y servicios activos, cargados solo mientras el diálogo está abierto.
  const branchOptions = useBranchOptions(open);
  const serviceOptions = useServiceOptions(open, { is_active: "1" });
  const serviceNames = useMemo(
    () => new Map(serviceOptions.options.map((option) => [option.value, option.label])),
    [serviceOptions.options],
  );

  // Un servicio elegido = una fila con su cupo (`quota`).
  const branchAccess = useWatch({ control, name: "branch_access" });
  const selectedServices = useWatch({ control, name: "services" });

  // Cada vez que se abre, sincroniza con el plan (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(plan ? membershipPlanToForm(plan) : membershipPlanFormDefaults);
  }, [open, plan, reset]);

  const onSubmit = form.handleSubmit(
    useResourceFormSubmit<MembershipPlanForm, MembershipPlanRow>({
      form,
      fields: MEMBERSHIP_PLAN_FORM_FIELDS,
      submit: (values) =>
        plan
          ? updatePlan.mutateAsync({
              id: plan.id,
              input: toUpdateMembershipPlanInput(values),
            })
          : createPlan.mutateAsync(toCreateMembershipPlanInput(values)),
      successMessage: (values) =>
        `Plan "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el plan."
        : "No se pudo crear el plan.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar plan" : "Nuevo plan de membresía"}
      description={
        isEdit
          ? "La moneda no se puede cambiar."
          : "Define el precio y la duración del plan."
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
          placeholder="Plan Mensual"
          autoFocus
        />

        <TextField
          {...bind("description")}
          label="Descripción"
          placeholder="Acceso ilimitado al gimnasio"
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

          <Field
            label="Moneda"
            htmlFor="membership-plan-currency"
            error={errors.currency?.message}
            hint={isEdit ? "No se puede cambiar." : undefined}
          >
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Combobox
                  id="membership-plan-currency"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CURRENCY_OPTIONS}
                  disabled={isEdit}
                  aria-invalid={errors.currency ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <TextField
          {...bind("duration_days")}
          label="Duración (días)"
          type="number"
          inputMode="numeric"
          min={1}
          step="1"
          placeholder="30"
          hint="P. ej. 30 (mensual), 90 (trimestral), 365 (anual)."
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

        <Field
          label="Acceso a sedes"
          htmlFor="membership-plan-branch-access"
          error={errors.branch_access?.message}
        >
          <Controller
            control={control}
            name="branch_access"
            render={({ field }) => (
              <Combobox
                id="membership-plan-branch-access"
                value={field.value}
                onValueChange={field.onChange}
                options={BRANCH_ACCESS_OPTIONS}
                aria-invalid={errors.branch_access ? true : undefined}
              />
            )}
          />
        </Field>

        {branchAccess === "specific" ? (
          <Field
            label="Sedes"
            htmlFor="membership-plan-branches"
            error={errors.branch_ids?.message}
          >
            <Controller
              control={control}
              name="branch_ids"
              render={({ field }) => (
                <MultiCombobox
                  id="membership-plan-branches"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={branchOptions.options}
                  placeholder="Selecciona las sedes…"
                  aria-invalid={errors.branch_ids ? true : undefined}
                />
              )}
            />
          </Field>
        ) : null}

        {branchAccess === "limited" ? (
          <TextField
            {...bind("max_branches")}
            label="Máximo de sedes"
            type="number"
            inputMode="numeric"
            min={1}
            step="1"
            placeholder="2"
            hint="Cuántas sedes puede elegir el cliente."
          />
        ) : null}

        <Field
          label="Servicios incluidos"
          htmlFor="membership-plan-services"
          error={
            typeof errors.services?.message === "string"
              ? errors.services.message
              : undefined
          }
          hint="Opcional. Define el cupo de usos de cada servicio."
        >
          <MultiCombobox
            id="membership-plan-services"
            value={selectedServices.map((row) => row.id)}
            onValueChange={(ids) => {
              const current = form.getValues("services");
              form.setValue(
                "services",
                ids.map(
                  (id) =>
                    current.find((row) => row.id === id) ?? {
                      id,
                      name: serviceNames.get(id) ?? id,
                      quota: "",
                    },
                ),
                { shouldDirty: true },
              );
            }}
            options={serviceOptions.options}
            placeholder="Selecciona los servicios…"
          />
        </Field>

        {selectedServices.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            {selectedServices.map((row, index) => (
              <div key={row.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm">
                  {serviceNames.get(row.id) ?? row.name}
                </span>
                <div className="w-40">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step="1"
                    placeholder="Ilimitado"
                    aria-label={`Cupo de ${row.name}`}
                    aria-invalid={errors.services?.[index]?.quota ? true : undefined}
                    {...register(`services.${index}.quota`)}
                  />
                </div>
              </div>
            ))}
            {errors.services?.some?.((item) => item?.quota) ? (
              <p className="text-xs text-destructive">
                El cupo debe ser un entero mayor o igual a 0.
              </p>
            ) : null}
          </div>
        ) : null}

        {isEdit ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-input"
              {...register("is_active")}
            />
            Plan activo (visible para asignar a miembros)
          </label>
        ) : null}
      </form>
    </AppDialog>
  );
}
