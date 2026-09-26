import { z } from "zod";
import {
  boundedText,
  enumFallback,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import { SERVICE_TYPES } from "./services.constants";
import type {
  CreateServiceInput,
  ServiceRow,
  UpdateServiceInput,
} from "./services.types";

/** Formulario de servicio (alta y edición). Los números viven como texto. */
export const serviceFormSchema = z.object({
  name: boundedText("El nombre", { max: 255 }),
  type: z.enum(SERVICE_TYPES),
  description: optionalText(500),
  sort_order: numericText("El orden"),
  is_active: z.boolean(),
});

export type ServiceForm = z.infer<typeof serviceFormSchema>;

export const serviceFormDefaults: ServiceForm = {
  name: "",
  type: "facility",
  description: "",
  sort_order: "0",
  is_active: true,
};

/** Campos que el backend puede devolver como error de validación. */
export const SERVICE_FORM_FIELDS = [
  "name",
  "type",
  "description",
  "sort_order",
  "is_active",
] as const satisfies readonly (keyof ServiceForm)[];

const normalizeType = enumFallback(SERVICE_TYPES, "facility");

/** Prellena el formulario con los datos de un servicio existente (modo edición). */
export function serviceToForm(service: ServiceRow): ServiceForm {
  return {
    name: service.name,
    type: normalizeType(service.type),
    description: service.description ?? "",
    sort_order: String(service.sort_order),
    is_active: Boolean(service.is_active),
  };
}

/** Convierte el formulario validado al cuerpo de `POST /services`. */
export function toCreateServiceInput(form: ServiceForm): CreateServiceInput {
  return {
    name: form.name,
    type: form.type,
    description: form.description || null,
    is_active: form.is_active,
    sort_order: Number(form.sort_order),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /services/{id}`. */
export function toUpdateServiceInput(form: ServiceForm): UpdateServiceInput {
  return {
    name: form.name,
    type: form.type,
    description: form.description || null,
    is_active: form.is_active,
    sort_order: Number(form.sort_order),
  };
}
