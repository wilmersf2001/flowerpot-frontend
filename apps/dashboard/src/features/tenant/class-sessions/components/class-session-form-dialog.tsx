"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { AppDialog, AsyncCombobox, Field, formatDate, useResourceFormSubmit } from "@/features/_shared";
import { useInstructorOptions } from "@/features/tenant/instructors";
import { useUpdateClassSession } from "../lib/class-sessions.hooks";
import { CLASS_SESSION_STATUSES, CLASS_SESSION_STATUS_LABELS } from "../lib/class-sessions.constants";
import {
  CLASS_SESSION_FORM_FIELDS,
  classSessionFormDefaults,
  classSessionFormSchema,
  classSessionToForm,
  toUpdateClassSessionInput,
  type ClassSessionForm,
} from "../lib/class-sessions.schema";
import type { ClassSessionRow } from "../lib/class-sessions.types";

const FORM_ID = "class-session-form";

const STATUS_OPTIONS: ComboboxOption[] = CLASS_SESSION_STATUSES.map((status) => ({
  value: status,
  label: CLASS_SESSION_STATUS_LABELS[status],
}));

/** `HH:MM:SS` -> `HH:MM`. */
function formatTime(value: string): string {
  return value.slice(0, 5);
}

/**
 * Diálogo de sesión de clase: solo permite cancelarla o reasignar el
 * instructor de ese día puntual. Fecha, clase y sede son de solo lectura
 * (copia congelada del horario al generarse la sesión).
 */
export function ClassSessionFormDialog({
  open,
  session,
  onOpenChangeAction,
}: {
  open: boolean;
  session: ClassSessionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const updateSession = useUpdateClassSession();
  const instructorOptions = useInstructorOptions(open);

  const form = useForm<ClassSessionForm>({
    resolver: zodResolver(classSessionFormSchema),
    defaultValues: classSessionFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Cada vez que se abre, sincroniza con la sesión.
  useEffect(() => {
    if (open) reset(session ? classSessionToForm(session) : classSessionFormDefaults);
  }, [open, session, reset]);

  const selectedInstructor: ComboboxOption | null = useMemo(
    () =>
      session?.instructor
        ? {
            value: session.instructor.id,
            label: session.instructor.staff?.full_name ?? "Instructor",
            hint: session.instructor.staff?.dni,
          }
        : null,
    [session],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ClassSessionForm, ClassSessionRow>({
      form,
      fields: CLASS_SESSION_FORM_FIELDS,
      // El formulario solo se pinta cuando hay `session` (ver el `session ? ... : null` de abajo).
      submit: (values) =>
        updateSession.mutateAsync({ id: session!.id, input: toUpdateClassSessionInput(values) }),
      successMessage: () => "Sesión actualizada.",
      errorMessage: "No se pudo actualizar la sesión.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Editar sesión"
      description="Cancela la sesión o reasigna el instructor de este día puntual."
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
          <Button type="submit" form={FORM_ID} disabled={isSubmitting || !session}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {session ? (
        <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {session.class_schedule?.gym_class?.name ?? "Clase"}
            </p>
            <p>
              {formatDate(session.session_date)} · {formatTime(session.start_time)}–
              {formatTime(session.end_time)}
            </p>
            <p>{session.class_schedule?.branch?.name ?? ""}</p>
          </div>

          <Field
            label="Instructor"
            htmlFor="class-session-instructor"
            error={errors.instructor_id?.message}
          >
            <Controller
              control={control}
              name="instructor_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="class-session-instructor"
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

          <Field label="Estado" htmlFor="class-session-status" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Combobox
                  id="class-session-status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={STATUS_OPTIONS}
                  aria-invalid={errors.status ? true : undefined}
                />
              )}
            />
          </Field>
        </form>
      ) : null}
    </AppDialog>
  );
}
