import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type {
  CreateDeviceInput,
  DeviceRow,
  UpdateDeviceInput,
} from "./devices.types";

/**
 * Formulario de lector (alta y edición). En edición el serial se muestra pero
 * no se envía: el backend no lo deja cambiar.
 */
export const deviceFormSchema = z.object({
  serial_number: boundedText("El número de serie", { max: 100 }),
  tenant_id: boundedText("El gimnasio", { max: 255 }),
  model: optionalText(100),
  notes: optionalText(500),
});

export type DeviceForm = z.infer<typeof deviceFormSchema>;

export const deviceFormDefaults: DeviceForm = {
  serial_number: "",
  tenant_id: "",
  model: "",
  notes: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const DEVICE_FORM_FIELDS = [
  "serial_number",
  "tenant_id",
  "model",
  "notes",
] as const satisfies readonly (keyof DeviceForm)[];

export function deviceToForm(device: DeviceRow): DeviceForm {
  return {
    serial_number: device.serial_number,
    tenant_id: device.tenant_id,
    model: device.model ?? "",
    notes: device.notes ?? "",
  };
}

export function toCreateDeviceInput(form: DeviceForm): CreateDeviceInput {
  return {
    serial_number: form.serial_number,
    tenant_id: form.tenant_id,
    model: form.model || undefined,
    notes: form.notes || undefined,
  };
}

export function toUpdateDeviceInput(form: DeviceForm): UpdateDeviceInput {
  return {
    tenant_id: form.tenant_id,
    model: form.model || null,
    notes: form.notes || null,
  };
}
