import { z } from "zod";
import { boundedText } from "@/features/_shared/form-schema";
import type { RoleInput, RoleRow } from "./roles.types";

/**
 * Formulario de rol (alta y edición). Los permisos viven como
 * `Record<nombre, marcado>` -no como array- porque así cada checkbox de la
 * matriz se controla con una sola clave (`permissions.${name}`), sin lógica
 * de push/splice sobre un array.
 */
export const roleFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  permissions: z
    .record(z.string(), z.boolean())
    .refine((value) => Object.values(value).some(Boolean), {
      message: "Selecciona al menos un permiso.",
    }),
});

export type RoleForm = z.infer<typeof roleFormSchema>;

export const roleFormDefaults: RoleForm = {
  name: "",
  permissions: {},
};

/** Campos que el backend puede devolver como error de validación. */
export const ROLE_FORM_FIELDS = [
  "name",
  "permissions",
] as const satisfies readonly (keyof RoleForm)[];

/** Prellena el formulario con los datos de un rol existente (modo edición). */
export function roleToForm(role: RoleRow): RoleForm {
  return {
    name: role.name,
    permissions: Object.fromEntries(
      role.permissions.map((permission) => [permission.name, true]),
    ),
  };
}

/** Convierte el formulario validado al cuerpo de `POST/PATCH /roles`. */
export function toRoleInput(form: RoleForm): RoleInput {
  return {
    name: form.name,
    permissions: Object.entries(form.permissions)
      .filter(([, checked]) => checked)
      .map(([name]) => name),
  };
}
