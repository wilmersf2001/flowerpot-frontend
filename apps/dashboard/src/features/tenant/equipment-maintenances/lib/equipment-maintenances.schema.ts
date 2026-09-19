import { z } from "zod";
import { boundedText, numericText, requiredText } from "@/features/_shared/form-schema";
import { EQUIPMENT_MAINTENANCE_TYPES } from "./equipment-maintenances.constants";
import type {
  CompleteEquipmentMaintenanceInput,
  CreateEquipmentMaintenanceInput,
  EquipmentMaintenanceRow,
  UpdateEquipmentMaintenanceInput,
} from "./equipment-maintenances.types";

/**
 * Un solo schema para alta y edición: en edición el padre deshabilita
 * `equipment_id`/`type` (el backend no los acepta en `PATCH`) y
 * `toUpdateEquipmentMaintenanceInput` simplemente no los envía.
 */
export const equipmentMaintenanceFormSchema = z
  .object({
    equipment_id: requiredText("El equipo"),
    supplier_id: requiredText("El proveedor"),
    type: z.enum(EQUIPMENT_MAINTENANCE_TYPES),
    description: boundedText("La descripción", { max: 2000 }),
    scheduled_date: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "preventivo" && !values.scheduled_date) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduled_date"],
        message: "La fecha programada es obligatoria para mantenimientos preventivos.",
      });
    }
  });

export type EquipmentMaintenanceForm = z.infer<typeof equipmentMaintenanceFormSchema>;

export const equipmentMaintenanceFormDefaults: EquipmentMaintenanceForm = {
  equipment_id: "",
  supplier_id: "",
  type: "preventivo",
  description: "",
  scheduled_date: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const EQUIPMENT_MAINTENANCE_FORM_FIELDS = [
  "equipment_id",
  "supplier_id",
  "type",
  "description",
  "scheduled_date",
] as const satisfies readonly (keyof EquipmentMaintenanceForm)[];

/** Prellena el formulario con un mantenimiento existente (edición, solo si está `programado`). */
export function equipmentMaintenanceToForm(
  maintenance: EquipmentMaintenanceRow,
): EquipmentMaintenanceForm {
  return {
    equipment_id: maintenance.equipment_id,
    supplier_id: maintenance.supplier_id,
    type: maintenance.type,
    description: maintenance.description,
    scheduled_date: maintenance.scheduled_date ?? "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /equipment-maintenances`. */
export function toCreateEquipmentMaintenanceInput(
  form: EquipmentMaintenanceForm,
): CreateEquipmentMaintenanceInput {
  return {
    equipment_id: Number(form.equipment_id),
    supplier_id: Number(form.supplier_id),
    type: form.type,
    description: form.description,
    scheduled_date: form.scheduled_date || undefined,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /equipment-maintenances/{id}`. */
export function toUpdateEquipmentMaintenanceInput(
  form: EquipmentMaintenanceForm,
): UpdateEquipmentMaintenanceInput {
  return {
    supplier_id: Number(form.supplier_id),
    scheduled_date: form.scheduled_date || undefined,
    description: form.description,
  };
}

export const completeEquipmentMaintenanceFormSchema = z.object({
  cost: numericText("El costo del mantenimiento", { min: 0 }),
  next_maintenance_date: z.string(),
});

export type CompleteEquipmentMaintenanceForm = z.infer<
  typeof completeEquipmentMaintenanceFormSchema
>;

export const completeEquipmentMaintenanceFormDefaults: CompleteEquipmentMaintenanceForm = {
  cost: "",
  next_maintenance_date: "",
};

export const COMPLETE_EQUIPMENT_MAINTENANCE_FORM_FIELDS = [
  "cost",
  "next_maintenance_date",
] as const satisfies readonly (keyof CompleteEquipmentMaintenanceForm)[];

/** Convierte el formulario validado al cuerpo de `PATCH /equipment-maintenances/{id}/complete`. */
export function toCompleteEquipmentMaintenanceInput(
  form: CompleteEquipmentMaintenanceForm,
): CompleteEquipmentMaintenanceInput {
  return {
    cost: Number(form.cost),
    next_maintenance_date: form.next_maintenance_date || undefined,
  };
}
