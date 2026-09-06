import { z } from "zod";
import { TENANT_ID_PATTERN } from "./tenants.constants";

/** Formulario de "Nuevo gimnasio". Espeja las reglas del `StoreTenantRequest`. */
export const createTenantSchema = z.object({
  id: z
    .string()
    .min(1, "El identificador es obligatorio.")
    .max(63, "Máximo 63 caracteres.")
    .regex(
      TENANT_ID_PATTERN,
      "Solo letras, números, guion (-) y guion bajo (_).",
    ),
});

export type CreateTenantForm = z.infer<typeof createTenantSchema>;
