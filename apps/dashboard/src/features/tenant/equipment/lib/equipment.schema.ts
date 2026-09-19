import { z } from "zod";
import { boundedText, optionalText, requiredText } from "@/features/_shared/form-schema";
import type { CreateEquipmentInput, EquipmentRow, UpdateEquipmentInput } from "./equipment.types";

export const equipmentFormSchema = z.object({
  equipment_category_id: z.string(),
  branch_id: requiredText("La sede"),
  name: boundedText("El nombre", { max: 255 }),
  brand: optionalText(255),
  model: optionalText(255),
  serial_number: optionalText(255),
  purchase_date: z.string(),
  purchase_cost: optionalText(20).refine(
    (value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
    "El costo de compra debe ser mayor o igual a 0.",
  ),
  warranty_expiration: z.string(),
});

export type EquipmentForm = z.infer<typeof equipmentFormSchema>;

export const equipmentFormDefaults: EquipmentForm = {
  equipment_category_id: "",
  branch_id: "",
  name: "",
  brand: "",
  model: "",
  serial_number: "",
  purchase_date: "",
  purchase_cost: "",
  warranty_expiration: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const EQUIPMENT_FORM_FIELDS = [
  "equipment_category_id",
  "branch_id",
  "name",
  "brand",
  "model",
  "serial_number",
  "purchase_date",
  "purchase_cost",
  "warranty_expiration",
] as const satisfies readonly (keyof EquipmentForm)[];

/** Prellena el formulario con los datos de un equipo existente (modo edición). */
export function equipmentToForm(equipment: EquipmentRow): EquipmentForm {
  return {
    equipment_category_id: equipment.equipment_category_id ?? "",
    branch_id: equipment.branch_id,
    name: equipment.name,
    brand: equipment.brand ?? "",
    model: equipment.model ?? "",
    serial_number: equipment.serial_number ?? "",
    purchase_date: equipment.purchase_date ?? "",
    purchase_cost: equipment.purchase_cost ? String(equipment.purchase_cost) : "",
    warranty_expiration: equipment.warranty_expiration ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /equipment`. */
export function toCreateEquipmentInput(form: EquipmentForm): CreateEquipmentInput {
  return {
    equipment_category_id: form.equipment_category_id ? Number(form.equipment_category_id) : null,
    branch_id: Number(form.branch_id),
    name: form.name,
    brand: form.brand || null,
    model: form.model || null,
    serial_number: form.serial_number || null,
    purchase_date: form.purchase_date || null,
    purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : null,
    warranty_expiration: form.warranty_expiration || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /equipment/{id}`. */
export function toUpdateEquipmentInput(form: EquipmentForm): UpdateEquipmentInput {
  return toCreateEquipmentInput(form);
}
