"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  AsyncCombobox,
  Field,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useCreateAttendance, useMemberOptions } from "../lib/attendance.hooks";
import {
  ATTENDANCE_FORM_FIELDS,
  attendanceFormDefaults,
  attendanceFormSchema,
  toCreateAttendanceInput,
  type AttendanceForm,
} from "../lib/attendance.schema";
import type { AttendanceRow } from "../lib/attendance.types";

const FORM_ID = "attendance-form";

/**
 * Diálogo de registro manual de asistencia (check-in). Solo alta: el backend
 * no expone `update`, y el borrado es un registro aparte (`DeleteAttendanceDialog`).
 * Controlado por el padre.
 */
export function AttendanceFormDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const createAttendance = useCreateAttendance();
  const memberOptions = useMemberOptions(open);

  const form = useForm<AttendanceForm>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: attendanceFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "attendance");

  // Cada vez que se abre, limpia el formulario.
  useEffect(() => {
    if (open) reset(attendanceFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<AttendanceForm, AttendanceRow>({
      form,
      fields: ATTENDANCE_FORM_FIELDS,
      submit: (values) => createAttendance.mutateAsync(toCreateAttendanceInput(values)),
      successMessage: () => "Asistencia registrada.",
      errorMessage: "No se pudo registrar la asistencia.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Registrar asistencia"
      description="Registra el ingreso manual de un socio a una sede."
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
            {isSubmitting ? "Registrando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Socio" htmlFor="attendance-member" error={errors.member_id?.message}>
          <Controller
            control={control}
            name="member_id"
            render={({ field }) => (
              <AsyncCombobox
                id="attendance-member"
                value={field.value}
                onValueChange={field.onChange}
                source={memberOptions}
                placeholder="Selecciona un socio"
                searchPlaceholder="Buscar por nombre o DNI…"
                emptyText="Sin socios."
                aria-invalid={errors.member_id ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("notes")}
          label="Notas"
          hint="Opcional."
          placeholder="Observaciones del ingreso…"
        />
      </form>
    </AppDialog>
  );
}
