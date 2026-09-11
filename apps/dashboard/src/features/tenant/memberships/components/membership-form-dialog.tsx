"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  useCreateMembership,
  useUpdateMembership,
  useMemberOptions,
  useMembershipPlanOptions,
} from "../lib/memberships.hooks";
import {
  MEMBERSHIP_CREATE_STATUSES,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUSES,
} from "../lib/memberships.constants";
import {
  MEMBERSHIP_FORM_FIELDS,
  membershipFormDefaults,
  membershipFormSchema,
  membershipToForm,
  toCreateMembershipInput,
  toUpdateMembershipInput,
  type MembershipForm,
} from "../lib/memberships.schema";
import type { MembershipRow } from "../lib/memberships.types";

const FORM_ID = "membership-form";

/** Estados: lista fija -> `Combobox` sin buscador. Distinta según alta/edición. */
const CREATE_STATUS_OPTIONS: ComboboxOption[] = MEMBERSHIP_CREATE_STATUSES.map(
  (status) => ({ value: status, label: MEMBERSHIP_STATUS_LABELS[status] }),
);
const EDIT_STATUS_OPTIONS: ComboboxOption[] = MEMBERSHIP_STATUSES.map(
  (status) => ({ value: status, label: MEMBERSHIP_STATUS_LABELS[status] }),
);

/**
 * Diálogo de membresía. Sin `membership` es "Nueva membresía" (POST); con
 * `membership` es "Editar membresía" (PATCH). El backend no deja cambiar
 * socio, plan ni fecha de inicio una vez creada. Controlado por el padre.
 */
export function MembershipFormDialog({
  open,
  membership = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Membresía a editar. `null`/ausente => modo alta. */
  membership?: MembershipRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = membership !== null;
  const createMembership = useCreateMembership();
  const updateMembership = useUpdateMembership();

  // Selects asíncronos: solo se usan en alta (en edición van de solo lectura).
  const memberOptions = useMemberOptions(!isEdit);
  const planOptions = useMembershipPlanOptions(!isEdit);

  // Modo edición: el socio/plan pueden no venir en la 1ª página de
  // resultados, así que damos su etiqueta a mano desde la fila.
  const selectedMemberOption: ComboboxOption | null = membership
    ? { value: membership.member_id, label: membership.member_name || membership.member_id }
    : null;
  const selectedPlanOption: ComboboxOption | null = membership
    ? {
        value: membership.membership_plan_id,
        label: membership.plan_name,
        hint: membership.plan_price_formatted || undefined,
      }
    : null;

  const form = useForm<MembershipForm>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: membershipFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "membership");

  // Cada vez que se abre, sincroniza con la membresía (edición) o limpia.
  useEffect(() => {
    if (open) {
      reset(membership ? membershipToForm(membership) : membershipFormDefaults);
    }
  }, [open, membership, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<MembershipForm, MembershipRow>({
      form,
      fields: MEMBERSHIP_FORM_FIELDS,
      submit: (values) =>
        membership
          ? updateMembership.mutateAsync({
              id: membership.id,
              input: toUpdateMembershipInput(values),
            })
          : createMembership.mutateAsync(toCreateMembershipInput(values)),
      successMessage: () =>
        `Membresía ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la membresía."
        : "No se pudo crear la membresía.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar membresía" : "Nueva membresía"}
      description={
        isEdit
          ? "El socio, el plan y la fecha de inicio no se pueden cambiar."
          : "Asigna un plan a un socio y define su vigencia."
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
                : "Crear membresía"}
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
          label="Socio"
          htmlFor="membership-member"
          error={errors.member_id?.message}
        >
          <Controller
            control={control}
            name="member_id"
            render={({ field }) => (
              <AsyncCombobox
                id="membership-member"
                value={field.value}
                onValueChange={field.onChange}
                source={memberOptions}
                selectedOption={selectedMemberOption}
                disabled={isEdit}
                placeholder="Selecciona un socio"
                searchPlaceholder="Buscar por nombre o DNI…"
                emptyText="Sin socios."
                aria-invalid={errors.member_id ? true : undefined}
              />
            )}
          />
        </Field>

        <Field
          label="Plan"
          htmlFor="membership-plan"
          error={errors.membership_plan_id?.message}
        >
          <Controller
            control={control}
            name="membership_plan_id"
            render={({ field }) => (
              <AsyncCombobox
                id="membership-plan"
                value={field.value}
                onValueChange={field.onChange}
                source={planOptions}
                selectedOption={selectedPlanOption}
                disabled={isEdit}
                placeholder="Selecciona un plan"
                searchPlaceholder="Buscar plan…"
                emptyText="Sin planes."
                aria-invalid={errors.membership_plan_id ? true : undefined}
              />
            )}
          />
        </Field>

        <DateField
          form={form}
          name="starts_at"
          idPrefix="membership"
          label="Inicio"
          disabled={isEdit}
        />

        <Field
          label="Estado"
          htmlFor="membership-status"
          error={errors.status?.message}
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox
                id="membership-status"
                value={field.value}
                onValueChange={field.onChange}
                options={isEdit ? EDIT_STATUS_OPTIONS : CREATE_STATUS_OPTIONS}
                aria-invalid={errors.status ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Descuentos, acuerdos, observaciones…"
        />
      </form>
    </AppDialog>
  );
}
