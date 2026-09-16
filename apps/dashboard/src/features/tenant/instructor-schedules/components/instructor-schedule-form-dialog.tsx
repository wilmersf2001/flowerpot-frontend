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
import {
  useCreateInstructorSchedule,
  useUpdateInstructorSchedule,
} from "../lib/instructor-schedules.hooks";
import { DAY_OF_WEEK_OPTIONS } from "../lib/instructor-schedules.constants";
import {
  INSTRUCTOR_SCHEDULE_FORM_FIELDS,
  instructorScheduleFormDefaults,
  instructorScheduleFormSchema,
  instructorScheduleToForm,
  toCreateInstructorScheduleInput,
  toUpdateInstructorScheduleInput,
  type InstructorScheduleForm,
} from "../lib/instructor-schedules.schema";
import type { InstructorScheduleRow } from "../lib/instructor-schedules.types";

const FORM_ID = "instructor-schedule-form";

const DAY_OPTIONS: ComboboxOption[] = DAY_OF_WEEK_OPTIONS.map((day) => ({
  value: day.value,
  label: day.label,
}));

/**
 * Diálogo de horario de instructor. Sin `schedule` es "Nuevo horario" (POST);
 * con `schedule` es "Editar horario" (PATCH). El instructor viene fijo del
 * padre (no se puede reasignar desde aquí).
 */
export function InstructorScheduleFormDialog({
  open,
  instructorId,
  schedule = null,
  onOpenChangeAction,
}: {
  open: boolean;
  instructorId: string;
  /** Horario a editar. `null`/ausente => modo alta. */
  schedule?: InstructorScheduleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = schedule !== null;
  const createSchedule = useCreateInstructorSchedule();
  const updateSchedule = useUpdateInstructorSchedule();
  const branchOptions = useBranchOptions(open);

  const form = useForm<InstructorScheduleForm>({
    resolver: zodResolver(instructorScheduleFormSchema),
    defaultValues: instructorScheduleFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "instructor-schedule");

  // Cada vez que se abre, sincroniza con el horario (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(schedule ? instructorScheduleToForm(schedule) : instructorScheduleFormDefaults);
  }, [open, schedule, reset]);

  const selectedBranch: ComboboxOption | null = useMemo(
    () =>
      schedule?.branch
        ? { value: schedule.branch.id, label: schedule.branch.name }
        : null,
    [schedule],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<InstructorScheduleForm, InstructorScheduleRow>({
      form,
      fields: INSTRUCTOR_SCHEDULE_FORM_FIELDS,
      submit: (values) =>
        schedule
          ? updateSchedule.mutateAsync({
              id: schedule.id,
              input: toUpdateInstructorScheduleInput(values),
            })
          : createSchedule.mutateAsync(toCreateInstructorScheduleInput(instructorId, values)),
      successMessage: () => `Horario ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el horario."
        : "No se pudo crear el horario.",
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
          ? "Actualiza la disponibilidad semanal del instructor."
          : "Define un bloque de disponibilidad semanal para el instructor."
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
        <Field label="Sede" htmlFor="instructor-schedule-branch" error={errors.branch_id?.message}>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <AsyncCombobox
                id="instructor-schedule-branch"
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

        <Field label="Día" htmlFor="instructor-schedule-day" error={errors.day_of_week?.message}>
          <Controller
            control={control}
            name="day_of_week"
            render={({ field }) => (
              <Combobox
                id="instructor-schedule-day"
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
      </form>
    </AppDialog>
  );
}
