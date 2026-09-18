"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useGymClassOptions } from "@/features/tenant/gym-classes";
import { useInstructorOptions } from "@/features/tenant/instructors";
import {
  useCreateClassSchedule,
  useUpdateClassSchedule,
} from "../lib/class-schedules.hooks";
import { DAY_OF_WEEK_OPTIONS } from "../lib/class-schedules.constants";
import {
  CLASS_SCHEDULE_FORM_FIELDS,
  classScheduleFormDefaults,
  classScheduleFormSchema,
  classScheduleToForm,
  toCreateClassScheduleInput,
  toUpdateClassScheduleInput,
  type ClassScheduleForm,
} from "../lib/class-schedules.schema";
import type { ClassScheduleRow } from "../lib/class-schedules.types";

const FORM_ID = "class-schedule-form";

const DAY_OPTIONS: ComboboxOption[] = DAY_OF_WEEK_OPTIONS.map((day) => ({
  value: day.value,
  label: day.label,
}));

/**
 * Diálogo de horario recurrente. Sin `schedule` es "Nuevo horario" (POST); con
 * `schedule` es "Editar horario" (PATCH). Controlado por el padre.
 */
export function ClassScheduleFormDialog({
  open,
  schedule = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Horario a editar. `null`/ausente => modo alta. */
  schedule?: ClassScheduleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = schedule !== null;
  const createSchedule = useCreateClassSchedule();
  const updateSchedule = useUpdateClassSchedule();
  const gymClassOptions = useGymClassOptions(open);
  const instructorOptions = useInstructorOptions(open);
  const branchOptions = useBranchOptions(open);

  const form = useForm<ClassScheduleForm>({
    resolver: zodResolver(classScheduleFormSchema),
    defaultValues: classScheduleFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "class-schedule");

  // Cada vez que se abre, sincroniza con el horario (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(schedule ? classScheduleToForm(schedule) : classScheduleFormDefaults);
  }, [open, schedule, reset]);

  const selectedGymClass: ComboboxOption | null = useMemo(
    () => (schedule?.gym_class ? { value: schedule.gym_class.id, label: schedule.gym_class.name } : null),
    [schedule],
  );

  const selectedInstructor: ComboboxOption | null = useMemo(
    () =>
      schedule?.instructor
        ? {
            value: schedule.instructor.id,
            label: schedule.instructor.staff?.full_name ?? "Instructor",
            hint: schedule.instructor.staff?.dni,
          }
        : null,
    [schedule],
  );

  const selectedBranch: ComboboxOption | null = useMemo(
    () => (schedule?.branch ? { value: schedule.branch.id, label: schedule.branch.name } : null),
    [schedule],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ClassScheduleForm, ClassScheduleRow>({
      form,
      fields: CLASS_SCHEDULE_FORM_FIELDS,
      submit: (values) =>
        schedule
          ? updateSchedule.mutateAsync({ id: schedule.id, input: toUpdateClassScheduleInput(values) })
          : createSchedule.mutateAsync(toCreateClassScheduleInput(values)),
      successMessage: () => `Horario ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit ? "No se pudo actualizar el horario." : "No se pudo crear el horario.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar horario" : "Nuevo horario"}
      description={
        isEdit
          ? "Actualiza la repetición semanal de esta clase."
          : "Define cuándo se repite semanalmente una clase del catálogo."
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
                : "Crear horario"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Clase" htmlFor="class-schedule-gym-class" error={errors.gym_class_id?.message}>
          <Controller
            control={control}
            name="gym_class_id"
            render={({ field }) => (
              <AsyncCombobox
                id="class-schedule-gym-class"
                value={field.value}
                onValueChange={field.onChange}
                source={gymClassOptions}
                selectedOption={selectedGymClass}
                placeholder="Selecciona una clase"
                searchPlaceholder="Buscar clase…"
                emptyText="Sin clases."
                aria-invalid={errors.gym_class_id ? true : undefined}
              />
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Instructor"
            htmlFor="class-schedule-instructor"
            error={errors.instructor_id?.message}
          >
            <Controller
              control={control}
              name="instructor_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="class-schedule-instructor"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={instructorOptions}
                  selectedOption={selectedInstructor}
                  placeholder="Selecciona un instructor"
                  searchPlaceholder="Buscar instructor…"
                  emptyText="Sin instructores."
                  aria-invalid={errors.instructor_id ? true : undefined}
                />
              )}
            />
          </Field>

          <Field label="Sede" htmlFor="class-schedule-branch" error={errors.branch_id?.message}>
            <Controller
              control={control}
              name="branch_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="class-schedule-branch"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={branchOptions}
                  selectedOption={selectedBranch}
                  placeholder="Selecciona una sede"
                  searchPlaceholder="Buscar sede…"
                  emptyText="Sin sedes."
                  aria-invalid={errors.branch_id ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <Field label="Día" htmlFor="class-schedule-day" error={errors.day_of_week?.message}>
          <Controller
            control={control}
            name="day_of_week"
            render={({ field }) => (
              <Combobox
                id="class-schedule-day"
                value={field.value}
                onValueChange={field.onChange}
                options={DAY_OPTIONS}
                placeholder="Selecciona un día"
                aria-invalid={errors.day_of_week ? true : undefined}
              />
            )}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("start_time")} label="Hora de inicio" type="time" />
          <TextField {...bind("end_time")} label="Hora de fin" type="time" />
        </div>

        <TextField
          {...bind("max_capacity")}
          label="Cupo máximo"
          type="number"
          inputMode="numeric"
          min={1}
          step="1"
          placeholder="20"
          hint="Opcional. Si se omite, usa el cupo de la clase."
        />
      </form>
    </AppDialog>
  );
}
