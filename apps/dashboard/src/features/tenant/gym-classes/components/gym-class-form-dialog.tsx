"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  Field,
  TextareaField,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useSpecialtyOptions } from "@/features/tenant/specialties";
import { useCreateGymClass, useUpdateGymClass } from "../lib/gym-classes.hooks";
import {
  GYM_CLASS_FORM_FIELDS,
  gymClassFormDefaults,
  gymClassFormSchema,
  gymClassToForm,
  toCreateGymClassInput,
  toUpdateGymClassInput,
  type GymClassForm,
} from "../lib/gym-classes.schema";
import type { GymClassRow } from "../lib/gym-classes.types";

const FORM_ID = "gym-class-form";

const NO_SPECIALTY_OPTION: ComboboxOption = { value: "", label: "Sin especialidad" };

/**
 * Diálogo de clase (catálogo). Sin `gymClass` es "Nueva clase" (POST); con
 * `gymClass` es "Editar clase" (PATCH). Controlado por el padre.
 */
export function GymClassFormDialog({
  open,
  gymClass = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Clase a editar. `null`/ausente => modo alta. */
  gymClass?: GymClassRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = gymClass !== null;
  const createGymClass = useCreateGymClass();
  const updateGymClass = useUpdateGymClass();
  const specialtyOptions = useSpecialtyOptions(open);

  const form = useForm<GymClassForm>({
    resolver: zodResolver(gymClassFormSchema),
    defaultValues: gymClassFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "gym-class");

  // Cada vez que se abre, sincroniza con la clase (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(gymClass ? gymClassToForm(gymClass) : gymClassFormDefaults);
  }, [open, gymClass, reset]);

  const specialtySelectOptions: ComboboxOption[] = useMemo(
    () => [NO_SPECIALTY_OPTION, ...specialtyOptions.options],
    [specialtyOptions.options],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<GymClassForm, GymClassRow>({
      form,
      fields: GYM_CLASS_FORM_FIELDS,
      submit: (values) =>
        gymClass
          ? updateGymClass.mutateAsync({ id: gymClass.id, input: toUpdateGymClassInput(values) })
          : createGymClass.mutateAsync(toCreateGymClassInput(values)),
      successMessage: (values) => `Clase "${values.name}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit ? "No se pudo actualizar la clase." : "No se pudo crear la clase.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar clase" : "Nueva clase"}
      description={
        isEdit
          ? "Actualiza los datos de la clase del catálogo."
          : "Crea una clase para el catálogo (sin día ni hora todavía)."
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
                : "Crear clase"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Zumba" autoFocus />

        <Field
          label="Especialidad"
          htmlFor="gym-class-specialty"
          hint="Opcional."
          error={errors.specialty_id?.message}
        >
          <Controller
            control={control}
            name="specialty_id"
            render={({ field }) => (
              <Combobox
                id="gym-class-specialty"
                value={field.value}
                onValueChange={field.onChange}
                options={specialtySelectOptions}
                searchable
                placeholder="Selecciona una especialidad"
                searchPlaceholder="Buscar especialidad…"
                emptyText="Sin especialidades."
                aria-invalid={errors.specialty_id ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Clase de baile cardiovascular…"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("duration_minutes")}
            label="Duración (min)"
            type="number"
            inputMode="numeric"
            min={1}
            step="1"
            placeholder="60"
          />
          <TextField
            {...bind("max_capacity")}
            label="Cupo máximo"
            type="number"
            inputMode="numeric"
            min={1}
            step="1"
            placeholder="20"
          />
        </div>
      </form>
    </AppDialog>
  );
}
