import { z } from "zod";
import { boundedText, requiredText } from "@/features/_shared/form-schema";
import type { DeviceRow, UpdateDeviceInput } from "./devices.types";

/** Formulario del lector: el cliente solo configura nombre, sede y estado. */
export const deviceFormSchema = z.object({
  name: boundedText("El nombre", { max: 100 }),
  branch_id: requiredText("La sede", "f"),
  is_active: z.boolean(),
});

export type DeviceForm = z.infer<typeof deviceFormSchema>;

export const deviceFormDefaults: DeviceForm = {
  name: "",
  branch_id: "",
  is_active: true,
};

/** Campos que el backend puede devolver como error de validación. */
export const DEVICE_FORM_FIELDS = [
  "name",
  "branch_id",
  "is_active",
] as const satisfies readonly (keyof DeviceForm)[];

export function deviceToForm(device: DeviceRow): DeviceForm {
  return {
    name: device.name ?? "",
    branch_id: device.branch_id ? String(device.branch_id) : "",
    is_active: Boolean(device.is_active),
  };
}

export function toUpdateDeviceInput(form: DeviceForm): UpdateDeviceInput {
  return {
    name: form.name,
    branch_id: Number(form.branch_id),
    is_active: form.is_active,
  };
}
