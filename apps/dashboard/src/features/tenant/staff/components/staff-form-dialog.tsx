"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  MultiCombobox,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreateStaff, useUpdateStaff, useJobPositionOptions, useBranchOptions } from "../lib/staff.hooks";
import {
  STAFF_FORM_FIELDS,
  staffFormDefaults,
  staffFormSchema,
  staffToForm,
  toCreateStaffInput,
  toUpdateStaffInput,
  type StaffForm,
} from "../lib/staff.schema";
import type { StaffRow } from "../lib/staff.types";

const FORM_ID = "staff-form";

/**
 * Diálogo de personal. Sin `staff` es "Nuevo miembro" (POST); con `staff` es
 * "Editar miembro" (PATCH). Controlado por el padre.
 */
export function StaffFormDialog({
  open,
  staff = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Miembro del personal a editar. `null`/ausente => modo alta. */
  staff?: StaffRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = staff !== null;
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const jobPositionOptions = useJobPositionOptions(open);
  const branchOptions = useBranchOptions(open);

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staffFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "staff");

  // Cada vez que se abre, sincroniza con el miembro (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(staff ? staffToForm(staff) : staffFormDefaults);
  }, [open, staff, reset]);

  const selectedJobPosition: ComboboxOption | null = useMemo(
    () =>
      staff?.job_position_id
        ? { value: staff.job_position_id, label: staff.job_position_name ?? "" }
        : null,
    [staff],
  );

  const branchStaticOptions: ComboboxOption[] = useMemo(
    () => branchOptions.options,
    [branchOptions.options],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<StaffForm, StaffRow>({
      form,
      fields: STAFF_FORM_FIELDS,
      submit: (values) =>
        staff
          ? updateStaff.mutateAsync({ id: staff.id, input: toUpdateStaffInput(values) })
          : createStaff.mutateAsync(toCreateStaffInput(values)),
      successMessage: (values) =>
        `"${values.first_name} ${values.last_name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar al miembro del personal."
        : "No se pudo crear al miembro del personal.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar personal" : "Nuevo personal"}
      description={
        isEdit
          ? "Actualiza los datos del miembro del personal."
          : "Registra un nuevo miembro del personal del gimnasio."
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
                : "Crear personal"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("first_name")} label="Nombres" placeholder="Juan" autoFocus />
          <TextField {...bind("last_name")} label="Apellidos" placeholder="Pérez" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("dni")} label="DNI" placeholder="12345678" />
          <DateField
            form={form}
            name="hire_date"
            idPrefix="staff"
            label="Fecha de contratación"
            toDate={new Date()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("email")} label="Correo" type="email" placeholder="personal@correo.com" />
          <TextField {...bind("phone")} label="Teléfono" placeholder="+51 999 999 999" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cargo" htmlFor="staff-job-position" error={errors.job_position_id?.message}>
            <Controller
              control={control}
              name="job_position_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="staff-job-position"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={jobPositionOptions}
                  selectedOption={selectedJobPosition}
                  placeholder="Selecciona un cargo"
                  searchPlaceholder="Buscar cargo…"
                  emptyText="Sin cargos."
                  aria-invalid={errors.job_position_id ? true : undefined}
                />
              )}
            />
          </Field>

          <TextField
            {...bind("salary")}
            label="Salario"
            placeholder="1500"
            hint="Opcional."
            inputMode="decimal"
          />
        </div>

        <Field label="Sedes" htmlFor="staff-branches" error={errors.branch_ids?.message}>
          <Controller
            control={control}
            name="branch_ids"
            render={({ field }) => (
              <MultiCombobox
                id="staff-branches"
                value={field.value}
                onValueChange={field.onChange}
                options={branchStaticOptions}
                placeholder="Selecciona sedes"
                searchPlaceholder="Buscar sede…"
                emptyText="Sin sedes."
                aria-invalid={errors.branch_ids ? true : undefined}
              />
            )}
          />
        </Field>
      </form>
    </AppDialog>
  );
}
