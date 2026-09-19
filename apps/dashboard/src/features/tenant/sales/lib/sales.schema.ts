import { z } from "zod";
import type { Path } from "react-hook-form";
import { numericText, optionalText, requiredText } from "@/features/_shared/form-schema";
import { SALE_PAYMENT_METHODS } from "./sales.constants";
import type { CreateSaleInput } from "./sales.types";

const saleItemSchema = z.object({
  product_id: requiredText("El producto"),
  quantity: numericText("La cantidad", { min: 1 }),
});

export type SaleItemForm = z.infer<typeof saleItemSchema>;

export const saleFormSchema = z
  .object({
    member_id: z.string(),
    payment_method: z.enum(SALE_PAYMENT_METHODS),
    payment_reference: optionalText(255),
    items: z.array(saleItemSchema).min(1, "Debes agregar al menos un producto."),
  })
  .refine(
    (form) => {
      const ids = form.items.map((item) => item.product_id).filter(Boolean);
      return new Set(ids).size === ids.length;
    },
    { message: "No repitas el mismo producto en dos líneas: agrupa la cantidad en una sola.", path: ["items"] },
  );

export type SaleForm = z.infer<typeof saleFormSchema>;

export const saleItemFormDefault: SaleItemForm = {
  product_id: "",
  quantity: "1",
};

export const saleFormDefaults: SaleForm = {
  member_id: "",
  payment_method: "efectivo",
  payment_reference: "",
  items: [saleItemFormDefault],
};

/**
 * Los errores 422 de línea llegan con clave `items.0.quantity`, etc. —
 * depende de cuántas líneas tenga el formulario, así que la lista de campos
 * conocidos se arma según la cantidad actual de líneas.
 */
export function saleFormFields(itemCount: number): Path<SaleForm>[] {
  const itemFields = Array.from(
    { length: itemCount },
    (_, i) => `items.${i}.product_id` as const,
  ).flatMap((productField, i) => [productField, `items.${i}.quantity` as const]);
  return ["member_id", "payment_method", "payment_reference", ...itemFields];
}

/** Convierte el formulario validado al cuerpo de `POST /sales` (sin `branch_id`, lo añade el hook). */
export function toCreateSaleInput(form: SaleForm): Omit<CreateSaleInput, "branch_id"> {
  return {
    member_id: form.member_id ? Number(form.member_id) : null,
    payment_method: form.payment_method,
    payment_reference: form.payment_reference || undefined,
    items: form.items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    })),
  };
}
