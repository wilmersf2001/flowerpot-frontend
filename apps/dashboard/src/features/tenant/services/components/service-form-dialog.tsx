"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox } from "@repo/ui/combobox";
import {
  AppDialog,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { SERVICE_TYPE_OPTIONS } from "../lib/services.constants";
import { useCreateService, useUpdateService } from "../lib/services.hooks";
import {
  SERVICE_FORM_FIELDS,
  serviceFormDefaults,
  serviceFormSchema,
  serviceToForm,
  toCreateServiceInput,
  toUpdateServiceInput,
  type ServiceForm,
} from "../lib/services.schema";
import type { ServiceRow } from "../lib/services.types";

const FORM_ID = "service-form";

/**
 * Diálogo de servicio. Sin `service` es "Nuevo servicio" (POST); con `service`
 * es "Editar servicio" (PATCH). Controlado por el padre.
 */
export function ServiceFormDialog({
  open,
  service = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Servicio a editar. `null`/ausente => modo alta. */
  service?: ServiceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = service !== null;
  const createService = useCreateService();
  const updateService = useUpdateService();

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: serviceFormDefaults,
  });
  const {
    control,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "service");

  useEffect(() => {
    if (open) reset(service ? serviceToForm(service) : serviceFormDefaults);
  }, [open, service, reset]);

  const onSubmit = form.handleSubmit(
    useResourceFormSubmit<ServiceForm, ServiceRow>({
      form,
      fields: SERVICE_FORM_FIELDS,
      submit: (values) =>
        service
          ? updateService.mutateAsync({
              id: service.id,
              input: toUpdateServiceInput(values),
            })
          : createService.mutateAsync(toCreateServiceInput(values)),
      successMessage: (values) =>
        `Servicio "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el servicio."
        : "No se pudo crear el servicio.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar servicio" : "Nuevo servicio"}
      description={
        isEdit
          ? "Actualiza los datos del servicio."
          : "Define un servicio (musculación, clases, nutrición…) para incluirlo en los planes."
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
                : "Crear servicio"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Musculación" autoFocus />

        <Field label="Tipo" htmlFor="service-type" error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Combobox
                id="service-type"
                value={field.value}
                onValueChange={field.onChange}
                options={SERVICE_TYPE_OPTIONS}
                aria-invalid={errors.type ? true : undefined}
              />
            )}
          />
        </Field>

        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Acceso a la sala de pesas…"
        />

        <TextField
          {...bind("sort_order")}
          label="Orden"
          type="number"
          inputMode="numeric"
          min={0}
          step="1"
          hint="Menor número aparece primero."
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("is_active")}
          />
          Servicio activo
        </label>
      </form>
    </AppDialog>
  );
}
