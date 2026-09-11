"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  useCreateMembershipPlan,
  useUpdateMembershipPlan,
} from "../lib/membership-plans.hooks";
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
    reset,
    register,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "membership-plan");

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
