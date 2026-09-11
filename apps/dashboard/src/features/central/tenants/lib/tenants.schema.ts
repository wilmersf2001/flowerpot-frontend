import { boundedText } from "@/features/_shared/form-schema";
import { z } from "zod";
import { TENANT_ID_PATTERN } from "./tenants.constants";

/** Formulario de "Nuevo gimnasio". Espeja las reglas del `StoreTenantRequest`. */
export const createTenantSchema = z.object({
  id: boundedText("El identificador", { max: 63 }).regex(
    TENANT_ID_PATTERN,
    "Solo letras, números, guion (-) y guion bajo (_).",
  ),
});

export type CreateTenantForm = z.infer<typeof createTenantSchema>;
