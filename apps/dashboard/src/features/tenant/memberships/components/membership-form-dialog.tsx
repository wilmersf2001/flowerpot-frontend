"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  MultiCombobox,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import {
  useCreateMembership,
  useUpdateMembership,
  useMemberOptions,
  useMembershipPlanOptions,
} from "../lib/memberships.hooks";
import {
  MEMBERSHIP_CREATE_STATUSES,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_TRANSITIONS,
} from "../lib/memberships.constants";
import {
  MEMBERSHIP_FORM_FIELDS,
  createMembershipFormSchema,
  membershipFormDefaults,
  membershipFormSchema,
  membershipStartBounds,
  membershipToForm,
  toCreateMembershipInput,
  toUpdateMembershipInput,
  type MembershipForm,
} from "../lib/memberships.schema";
import type { MembershipRow, MembershipStatus } from "../lib/memberships.types";

const FORM_ID = "membership-form";

/** Estados: lista fija -> `Combobox` sin buscador. Distinta según alta/edición. */
const CREATE_STATUS_OPTIONS: ComboboxOption[] = MEMBERSHIP_CREATE_STATUSES.map(
  (status) => ({ value: status, label: MEMBERSHIP_STATUS_LABELS[status] }),
);

/** En edición solo se ofrece el estado actual y los cambios permitidos. */
function editStatusOptions(current: MembershipStatus): ComboboxOption[] {
  return [current, ...(MEMBERSHIP_STATUS_TRANSITIONS[current] ?? [])].map((status) => ({
    value: status,
    label: MEMBERSHIP_STATUS_LABELS[status],
  }));
}

/** `YYYY-MM-DD` -> `Date` local, para los límites del calendario. */
function toLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

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

  // Selects asíncronos: solo se usan en alta (en edición van de solo lectura)
  // y solo mientras el diálogo está abierto, para no precargar en cada visita
  // a la página aunque el usuario nunca abra el formulario.
  const memberOptions = useMemberOptions(open && !isEdit);
  const planOptions = useMembershipPlanOptions(open && !isEdit, {
    is_active: "1",
  });

  // Modo edición: el socio/plan pueden no venir en la 1ª página de
  // resultados, así que damos su etiqueta a mano desde la fila.
  const selectedMemberOption: ComboboxOption | null = membership
    ? {
        value: String(membership.member_id),
        label: membership.member_name || String(membership.member_id),
      }
    : null;
  const selectedPlanOption: ComboboxOption | null = membership
    ? {
        value: String(membership.membership_plan_id ?? ""),
        label: membership.plan_name,
        hint: membership.plan_price_formatted || undefined,
      }
    : null;

  const branchOptions = useBranchOptions(open && !isEdit);

  const form = useForm<MembershipForm>({
    // La ventana de fechas de inicio solo aplica al crear.
    resolver: zodResolver(isEdit ? membershipFormSchema : createMembershipFormSchema),
    defaultValues: membershipFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitted, isSubmitting },
  } = form;
  const [planBranchAccess, planMaxBranches] = useWatch({
    control,
    name: ["plan_branch_access", "plan_max_branches"],
  });
  const startBounds = membershipStartBounds();
  const statusOptions = membership
    ? editStatusOptions(membership.status as MembershipStatus)
    : CREATE_STATUS_OPTIONS;
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
      successMessage: () => `Membresía ${isEdit ? "actualizada" : "creada"}.`,
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
                onValueChange={(value, option) => {
                  field.onChange(value);
                  // Guarda el modo de sedes del plan para pedir (o no) las sedes.
                  setValue("plan_branch_access", option.data?.branch_access ?? "");
                  setValue("plan_max_branches", option.data?.max_branches ?? "");
                  setValue("branches", [], { shouldValidate: isSubmitted });
                }}
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

        {!isEdit && planBranchAccess === "limited" ? (
          <Field
            label="Sedes"
            htmlFor="membership-branches"
            error={errors.branches?.message}
            hint={`Este plan permite elegir hasta ${planMaxBranches || 1} sede${planMaxBranches === "1" ? "" : "s"}.`}
          >
            <Controller
              control={control}
              name="branches"
              render={({ field }) => (
                <MultiCombobox
                  id="membership-branches"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={branchOptions.options}
                  placeholder="Selecciona las sedes…"
                  aria-invalid={errors.branches ? true : undefined}
                />
              )}
            />
          </Field>
        ) : null}

        <DateField
          form={form}
          name="starts_at"
          idPrefix="membership"
          label="Inicio"
          disabled={isEdit}
          fromDate={isEdit ? undefined : toLocalDate(startBounds.from)}
          toDate={isEdit ? undefined : toLocalDate(startBounds.to)}
        />

        <Field
          label="Estado"
          htmlFor="membership-status"
          error={errors.status?.message}
          hint={
            isEdit
              ? statusOptions.length === 1
                ? "Una membresía expirada o cancelada no se reactiva: crea una nueva."
                : undefined
              : "Se activa sola al registrar el primer pago (los planes gratis nacen activos)."
          }
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox
                id="membership-status"
                value={field.value}
                onValueChange={field.onChange}
                options={statusOptions}
                disabled={statusOptions.length === 1}
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
