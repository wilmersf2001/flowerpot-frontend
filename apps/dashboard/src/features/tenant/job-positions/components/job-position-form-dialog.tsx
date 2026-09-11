"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateJobPosition, useUpdateJobPosition } from "../lib/job-positions.hooks";
import {
  JOB_POSITION_FORM_FIELDS,
  jobPositionFormDefaults,
  jobPositionFormSchema,
  jobPositionToForm,
  toCreateJobPositionInput,
  toUpdateJobPositionInput,
  type JobPositionForm,
} from "../lib/job-positions.schema";
import type { JobPositionRow } from "../lib/job-positions.types";

const FORM_ID = "job-position-form";

/**
 * Diálogo de cargo. Sin `jobPosition` es "Nuevo cargo" (POST); con
 * `jobPosition` es "Editar cargo" (PATCH). Controlado por el padre.
 */
export function JobPositionFormDialog({
  open,
  jobPosition = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Cargo a editar. `null`/ausente => modo alta. */
  jobPosition?: JobPositionRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = jobPosition !== null;
  const createJobPosition = useCreateJobPosition();
  const updateJobPosition = useUpdateJobPosition();

  const form = useForm<JobPositionForm>({
    resolver: zodResolver(jobPositionFormSchema),
    defaultValues: jobPositionFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "job-position");

  // Cada vez que se abre, sincroniza con el cargo (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(jobPosition ? jobPositionToForm(jobPosition) : jobPositionFormDefaults);
  }, [open, jobPosition, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<JobPositionForm, JobPositionRow>({
      form,
      fields: JOB_POSITION_FORM_FIELDS,
      submit: (values) =>
        jobPosition
          ? updateJobPosition.mutateAsync({
              id: jobPosition.id,
              input: toUpdateJobPositionInput(values),
            })
          : createJobPosition.mutateAsync(toCreateJobPositionInput(values)),
      successMessage: (values) =>
        `Cargo "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el cargo."
        : "No se pudo crear el cargo.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar cargo" : "Nuevo cargo"}
      description={
        isEdit
          ? "Actualiza los datos del cargo o puesto."
          : "Crea un nuevo cargo o puesto para el personal."
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
                : "Crear cargo"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Entrenador" autoFocus />

        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Responsabilidades del cargo…"
        />
      </form>
    </AppDialog>
  );
}
