import { z } from "zod";
import { boundedText, numericText, optionalText } from "@/features/_shared/form-schema";
import type { CreateProductInput, ProductRow, UpdateProductInput } from "./products.types";

export const productFormSchema = z.object({
  product_category_id: z.string(),
  name: boundedText("El nombre", { max: 255 }),
  description: optionalText(2000),
  sku: boundedText("El SKU", { max: 100 }),
  sale_price: numericText("El precio de venta"),
  cost: optionalText(20).refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
    "El costo debe ser un número válido.",
  ),
});

export type ProductForm = z.infer<typeof productFormSchema>;

export const productFormDefaults: ProductForm = {
  product_category_id: "",
  name: "",
  description: "",
  sku: "",
  sale_price: "",
  cost: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const PRODUCT_FORM_FIELDS = [
  "product_category_id",
  "name",
  "description",
  "sku",
  "sale_price",
  "cost",
] as const satisfies readonly (keyof ProductForm)[];

/** Prellena el formulario con los datos de un producto existente (modo edición). */
export function productToForm(product: ProductRow): ProductForm {
  return {
    product_category_id: product.product_category_id ?? "",
    name: product.name,
    description: product.description,
    sku: product.sku,
    sale_price: String(product.sale_price),
    cost: product.cost ? String(product.cost) : "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /products`. */
export function toCreateProductInput(form: ProductForm): CreateProductInput {
  return {
    product_category_id: form.product_category_id ? Number(form.product_category_id) : null,
    name: form.name,
    description: form.description || null,
    sku: form.sku,
    sale_price: Number(form.sale_price),
    cost: form.cost ? Number(form.cost) : undefined,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /products/{id}`. */
export function toUpdateProductInput(form: ProductForm): UpdateProductInput {
  return {
    product_category_id: form.product_category_id ? Number(form.product_category_id) : null,
    name: form.name,
    description: form.description || null,
    sku: form.sku,
    sale_price: Number(form.sale_price),
    cost: form.cost ? Number(form.cost) : undefined,
  };
}
