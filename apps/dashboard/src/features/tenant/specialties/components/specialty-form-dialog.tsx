"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextareaField, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useCreateSpecialty, useUpdateSpecialty } from "../lib/specialties.hooks";
import {
  SPECIALTY_FORM_FIELDS,
  specialtyFormDefaults,
  specialtyFormSchema,
  specialtyToForm,
  toCreateSpecialtyInput,
  toUpdateSpecialtyInput,
  type SpecialtyForm,
} from "../lib/specialties.schema";
import type { SpecialtyRow } from "../lib/specialties.types";

const FORM_ID = "specialty-form";

/**
 * Diálogo de especialidad. Sin `specialty` es "Nueva especialidad" (POST); con
 * `specialty` es "Editar especialidad" (PATCH). Controlado por el padre.
 */
export function SpecialtyFormDialog({
  open,
  specialty = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Especialidad a editar. `null`/ausente => modo alta. */
  specialty?: SpecialtyRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = specialty !== null;
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();

  const form = useForm<SpecialtyForm>({
    resolver: zodResolver(specialtyFormSchema),
    defaultValues: specialtyFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "specialty");

  // Cada vez que se abre, sincroniza con la especialidad (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(specialty ? specialtyToForm(specialty) : specialtyFormDefaults);
  }, [open, specialty, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<SpecialtyForm, SpecialtyRow>({
      form,
      fields: SPECIALTY_FORM_FIELDS,
      submit: (values) =>
        specialty
          ? updateSpecialty.mutateAsync({
              id: specialty.id,
              input: toUpdateSpecialtyInput(values),
            })
          : createSpecialty.mutateAsync(toCreateSpecialtyInput(values)),
      successMessage: (values) =>
        `Especialidad "${values.name}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la especialidad."
        : "No se pudo crear la especialidad.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar especialidad" : "Nueva especialidad"}
      description={
        isEdit
          ? "Actualiza los datos de la especialidad."
          : "Crea una especialidad para asignar a los instructores."
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
                : "Crear especialidad"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Spinning" autoFocus />

        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Clase cardiovascular en bicicleta estática…"
        />
      </form>
    </AppDialog>
  );
}
