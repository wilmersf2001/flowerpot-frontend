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
  TextareaField,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  useCreateInstructor,
  useUpdateInstructor,
  useStaffOptions,
  useSpecialtyOptions,
} from "../lib/instructors.hooks";
import {
  INSTRUCTOR_FORM_FIELDS,
  instructorFormDefaults,
  instructorFormSchema,
  instructorToForm,
  toCreateInstructorInput,
  toUpdateInstructorInput,
  type InstructorForm,
} from "../lib/instructors.schema";
import type { InstructorRow } from "../lib/instructors.types";

const FORM_ID = "instructor-form";

/**
 * Diálogo de instructor. Sin `instructor` es "Nuevo instructor" (POST); con
 * `instructor` es "Editar instructor" (PATCH). El personal (`staff_id`) es
 * 1:1 y solo se fija al crear: en edición se muestra de solo lectura.
 */
export function InstructorFormDialog({
  open,
  instructor = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Instructor a editar. `null`/ausente => modo alta. */
  instructor?: InstructorRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = instructor !== null;
  const createInstructor = useCreateInstructor();
  const updateInstructor = useUpdateInstructor();
  const staffOptions = useStaffOptions(open && !isEdit);
  const specialtyOptions = useSpecialtyOptions(open);

  const form = useForm<InstructorForm>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: instructorFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "instructor");

  // Cada vez que se abre, sincroniza con el instructor (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(instructor ? instructorToForm(instructor) : instructorFormDefaults);
  }, [open, instructor, reset]);

  const selectedStaff: ComboboxOption | null = useMemo(
    () =>
      instructor?.staff
        ? { value: instructor.staff.id, label: instructor.staff.full_name, hint: instructor.staff.dni }
        : null,
    [instructor],
  );

  const specialtyStaticOptions: ComboboxOption[] = useMemo(
    () => specialtyOptions.options,
    [specialtyOptions.options],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<InstructorForm, InstructorRow>({
      form,
      fields: INSTRUCTOR_FORM_FIELDS,
      submit: (values) =>
        instructor
          ? updateInstructor.mutateAsync({
              id: instructor.id,
              input: toUpdateInstructorInput(values),
            })
          : createInstructor.mutateAsync(toCreateInstructorInput(values)),
      successMessage: () => `Instructor ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar al instructor."
        : "No se pudo crear al instructor.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar instructor" : "Nuevo instructor"}
      description={
        isEdit
          ? "Actualiza los datos del instructor."
          : "Registra a un miembro del personal como instructor."
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
                : "Crear instructor"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {isEdit ? (
          <Field label="Personal" htmlFor="instructor-staff-readonly" hint="No se puede cambiar.">
            <div
              id="instructor-staff-readonly"
              className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground"
            >
              {instructor.staff?.full_name ?? ""}
              {instructor.staff?.dni ? ` (${instructor.staff.dni})` : ""}
            </div>
          </Field>
        ) : (
          <Field label="Personal" htmlFor="instructor-staff" error={errors.staff_id?.message}>
            <Controller
              control={control}
              name="staff_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="instructor-staff"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={staffOptions}
                  selectedOption={selectedStaff}
                  placeholder="Selecciona un miembro del personal"
                  searchPlaceholder="Buscar por nombre o DNI…"
                  emptyText="Sin personal disponible."
                  aria-invalid={errors.staff_id ? true : undefined}
                />
              )}
            />
          </Field>
        )}

        <TextareaField
          {...bind("bio")}
          label="Biografía"
          hint="Opcional."
          placeholder="Instructor certificado en…"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("tarifa_por_clase")}
            label="Tarifa por clase"
            placeholder="50.00"
            hint="Opcional."
            inputMode="decimal"
          />
          <DateField
            form={form}
            name="fecha_inicio"
            idPrefix="instructor"
            label="Fecha de inicio"
            hint="Opcional."
          />
        </div>

        <Field
          label="Especialidades"
          htmlFor="instructor-specialties"
          error={errors.specialty_ids?.message as string | undefined}
        >
          <Controller
            control={control}
            name="specialty_ids"
            render={({ field }) => (
              <MultiCombobox
                id="instructor-specialties"
                value={field.value}
                onValueChange={field.onChange}
                options={specialtyStaticOptions}
                placeholder="Selecciona especialidades"
                searchPlaceholder="Buscar especialidad…"
                emptyText="Sin especialidades."
              />
            )}
          />
        </Field>
      </form>
    </AppDialog>
  );
}
