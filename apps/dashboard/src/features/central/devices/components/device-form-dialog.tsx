"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useTenantOptions } from "@/features/central/tenants/lib/tenants.hooks";
import { useCreateDevice, useUpdateDevice } from "../lib/devices.hooks";
import {
  DEVICE_FORM_FIELDS,
  deviceFormDefaults,
  deviceFormSchema,
  deviceToForm,
  toCreateDeviceInput,
  toUpdateDeviceInput,
  type DeviceForm,
} from "../lib/devices.schema";
import type { DeviceRow } from "../lib/devices.types";

const FORM_ID = "device-form";

/**
 * Diálogo de lector. Sin `device` es "Asignar lector" (POST); con `device` es
 * "Editar lector" (PATCH). `defaultTenantId` preselecciona el gimnasio en alta.
 */
export function DeviceFormDialog({
  open,
  device = null,
  defaultTenantId = "",
  onOpenChangeAction,
}: {
  open: boolean;
  device?: DeviceRow | null;
  defaultTenantId?: string;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = device !== null;
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const tenantOptions = useTenantOptions(open);

  // El gimnasio actual puede no venir en la 1ª página de resultados.
  const currentTenant = device?.tenant_id ?? defaultTenantId;
  const selectedTenant: ComboboxOption | null = currentTenant
    ? { value: currentTenant, label: currentTenant }
    : null;

  const form = useForm<DeviceForm>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: deviceFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "device");

  useEffect(() => {
    if (open) {
      reset(
        device
          ? deviceToForm(device)
          : { ...deviceFormDefaults, tenant_id: defaultTenantId },
      );
    }
  }, [open, device, defaultTenantId, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<DeviceForm, unknown>({
      form,
      fields: DEVICE_FORM_FIELDS,
      submit: (values) =>
        device
          ? updateDevice.mutateAsync({
              id: device.id,
              input: toUpdateDeviceInput(values),
            })
          : createDevice.mutateAsync(toCreateDeviceInput(values)),
      successMessage: (values) =>
        `Lector "${values.serial_number}" ${isEdit ? "actualizado" : "asignado"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar el lector."
        : "No se pudo asignar el lector.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar lector" : "Asignar lector"}
      description={
        isEdit
          ? "El número de serie no se puede cambiar: retira el lector y asígnalo de nuevo."
          : "Registra el lector biométrico y asígnalo a un gimnasio."
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
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Asignar lector"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextField
          {...bind("serial_number")}
          label="Número de serie"
          placeholder="ABC1234567"
          readOnly={isEdit}
          autoFocus={!isEdit}
          hint={isEdit ? "No se puede cambiar." : undefined}
        />

        <Field
          label="Gimnasio"
          htmlFor="device-tenant"
          error={errors.tenant_id?.message}
        >
          <Controller
            control={control}
            name="tenant_id"
            render={({ field }) => (
              <AsyncCombobox
                id="device-tenant"
                value={field.value}
                onValueChange={field.onChange}
                source={tenantOptions}
                selectedOption={selectedTenant}
                placeholder="Selecciona un gimnasio"
                searchPlaceholder="Buscar gimnasio…"
                emptyText="Sin gimnasios."
                aria-invalid={errors.tenant_id ? true : undefined}
              />
            )}
          />
        </Field>

        <TextField
          {...bind("model")}
          label="Modelo"
          placeholder="ZKTeco SpeedFace"
        />

        <TextareaField
          {...bind("notes")}
          label="Notas"
          placeholder="Ubicado en la entrada principal"
        />
      </form>
    </AppDialog>
  );
}
