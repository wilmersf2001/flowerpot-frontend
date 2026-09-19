import { z } from "zod";
import { boundedText } from "@/features/_shared/form-schema";
import type {
  CreateProductCategoryInput,
  ProductCategoryRow,
  UpdateProductCategoryInput,
} from "./product-categories.types";

export const productCategoryFormSchema = z.object({
  name: boundedText("El nombre", { max: 255 }),
});

export type ProductCategoryForm = z.infer<typeof productCategoryFormSchema>;

export const productCategoryFormDefaults: ProductCategoryForm = {
  name: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const PRODUCT_CATEGORY_FORM_FIELDS = [
  "name",
] as const satisfies readonly (keyof ProductCategoryForm)[];

/** Prellena el formulario con los datos de una categoría existente (modo edición). */
export function productCategoryToForm(category: ProductCategoryRow): ProductCategoryForm {
  return {
    name: category.name,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /product-categories`. */
export function toCreateProductCategoryInput(
  form: ProductCategoryForm,
): CreateProductCategoryInput {
  return {
    name: form.name,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /product-categories/{id}`. */
export function toUpdateProductCategoryInput(
  form: ProductCategoryForm,
): UpdateProductCategoryInput {
  return {
    name: form.name,
  };
}
