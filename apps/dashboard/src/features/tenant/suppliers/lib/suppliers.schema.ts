import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type { CreateSupplierInput, SupplierRow, UpdateSupplierInput } from "./suppliers.types";

export const supplierFormSchema = z.object({
  name: boundedText("El nombre", { max: 255 }),
  ruc: optionalText(11),
  phone: optionalText(20),
  email: z
    .string()
    .trim()
    .max(255, "Máximo 255 caracteres.")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Correo inválido.",
    }),
  address: optionalText(500),
});

export type SupplierForm = z.infer<typeof supplierFormSchema>;

export const supplierFormDefaults: SupplierForm = {
  name: "",
  ruc: "",
  phone: "",
  email: "",
  address: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const SUPPLIER_FORM_FIELDS = [
  "name",
  "ruc",
  "phone",
  "email",
  "address",
] as const satisfies readonly (keyof SupplierForm)[];

/** Prellena el formulario con los datos de un proveedor existente (modo edición). */
export function supplierToForm(supplier: SupplierRow): SupplierForm {
  return {
    name: supplier.name,
    ruc: supplier.ruc ?? "",
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /suppliers`. */
export function toCreateSupplierInput(form: SupplierForm): CreateSupplierInput {
  return {
    name: form.name,
    ruc: form.ruc || null,
    phone: form.phone || null,
    email: form.email || null,
    address: form.address || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /suppliers/{id}`. */
export function toUpdateSupplierInput(form: SupplierForm): UpdateSupplierInput {
  return {
    name: form.name,
    ruc: form.ruc || null,
    phone: form.phone || null,
    email: form.email || null,
    address: form.address || null,
  };
}
