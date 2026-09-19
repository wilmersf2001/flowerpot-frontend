import { z } from "zod";
import { boundedText } from "@/features/_shared/form-schema";
import type {
  CreateEquipmentCategoryInput,
  EquipmentCategoryRow,
  UpdateEquipmentCategoryInput,
} from "./equipment-categories.types";

export const equipmentCategoryFormSchema = z.object({
  name: boundedText("El nombre", { max: 255 }),
});

export type EquipmentCategoryForm = z.infer<typeof equipmentCategoryFormSchema>;

export const equipmentCategoryFormDefaults: EquipmentCategoryForm = {
  name: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const EQUIPMENT_CATEGORY_FORM_FIELDS = [
  "name",
] as const satisfies readonly (keyof EquipmentCategoryForm)[];

/** Prellena el formulario con los datos de una categoría existente (modo edición). */
export function equipmentCategoryToForm(category: EquipmentCategoryRow): EquipmentCategoryForm {
  return {
    name: category.name,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /equipment-categories`. */
export function toCreateEquipmentCategoryInput(
  form: EquipmentCategoryForm,
): CreateEquipmentCategoryInput {
  return {
    name: form.name,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /equipment-categories/{id}`. */
export function toUpdateEquipmentCategoryInput(
  form: EquipmentCategoryForm,
): UpdateEquipmentCategoryInput {
  return {
    name: form.name,
  };
}
