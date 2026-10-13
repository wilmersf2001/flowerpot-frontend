"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  EM_DASH,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useUpdateDevice } from "../lib/devices.hooks";
import {
  DEVICE_FORM_FIELDS,
  deviceFormDefaults,
  deviceFormSchema,
  deviceToForm,
  toUpdateDeviceInput,
  type DeviceForm,
} from "../lib/devices.schema";
import type { DeviceRow } from "../lib/devices.types";

const FORM_ID = "device-form";

/** Configura un lector: nombre, sede y estado. Serial y modelo son de solo lectura. */
export function DeviceFormDialog({
  device,
  onOpenChangeAction,
}: {
  device: DeviceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = device !== null;
  const updateDevice = useUpdateDevice();
  const branchOptions = useBranchOptions(open);

  // La sede actual puede no venir en la 1ª página de resultados.
  const selectedBranch: ComboboxOption | null =
    device?.branch_id && device.branch
      ? { value: String(device.branch_id), label: device.branch.name }
      : null;

  const form = useForm<DeviceForm>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: deviceFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "device");

  useEffect(() => {
    if (device) reset(deviceToForm(device));
  }, [device, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<DeviceForm, unknown>({
      form,
      fields: DEVICE_FORM_FIELDS,
      submit: (values) =>
        updateDevice.mutateAsync({
          id: device!.id,
          input: toUpdateDeviceInput(values),
        }),
      successMessage: (values) => `Lector "${values.name}" actualizado.`,
      errorMessage: "No se pudo actualizar el lector.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Configurar lector"
      description={
        device?.is_pending
          ? "Este lector fue asignado a tu gimnasio. Elige su sede y ponle un nombre."
          : "Cambia el nombre, la sede o el estado del lector."
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
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
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
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Serie</span>
            <span className="text-sm text-muted-foreground">
              {device?.serial_number ?? EM_DASH}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Modelo</span>
            <span className="text-sm text-muted-foreground">
              {device?.model || EM_DASH}
            </span>
          </div>
        </div>

        <TextField
          {...bind("name")}
          label="Nombre"
          placeholder="Entrada principal"
          autoFocus
        />

        <Field label="Sede" htmlFor="device-branch" error={errors.branch_id?.message}>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <AsyncCombobox
                id="device-branch"
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("is_active")}
          />
          Lector activo
        </label>
      </form>
    </AppDialog>
  );
}
