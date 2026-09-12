import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type {
  CreateExpenseCategoryInput,
  ExpenseCategoryRow,
  UpdateExpenseCategoryInput,
} from "./expense-categories.types";

export const expenseCategoryFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  description: optionalText(255),
});

export type ExpenseCategoryForm = z.infer<typeof expenseCategoryFormSchema>;

export const expenseCategoryFormDefaults: ExpenseCategoryForm = {
  name: "",
  description: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const EXPENSE_CATEGORY_FORM_FIELDS = [
  "name",
  "description",
] as const satisfies readonly (keyof ExpenseCategoryForm)[];

/** Prellena el formulario con los datos de una categoría existente (modo edición). */
export function expenseCategoryToForm(category: ExpenseCategoryRow): ExpenseCategoryForm {
  return {
    name: category.name,
    description: category.description,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /expense-categories`. */
export function toCreateExpenseCategoryInput(
  form: ExpenseCategoryForm,
): CreateExpenseCategoryInput {
  return {
    name: form.name,
    description: form.description || undefined,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /expense-categories/{id}`. */
export function toUpdateExpenseCategoryInput(
  form: ExpenseCategoryForm,
): UpdateExpenseCategoryInput {
  return {
    name: form.name,
    description: form.description || undefined,
  };
}
