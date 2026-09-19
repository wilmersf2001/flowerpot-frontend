// TODO(gen): `api.d.ts` todavía no tiene `EquipmentMaintenanceResource`. Se
// escribe a mano y se reemplaza al correr `npm run gen -w packages/types`.

import type {
  EQUIPMENT_MAINTENANCE_STATUSES,
  EQUIPMENT_MAINTENANCE_TYPES,
} from "./equipment-maintenances.constants";

export type EquipmentMaintenanceType = (typeof EQUIPMENT_MAINTENANCE_TYPES)[number];
export type EquipmentMaintenanceStatus = (typeof EQUIPMENT_MAINTENANCE_STATUSES)[number];

/** Equipo referenciado desde un mantenimiento (no el `EquipmentRow` completo del otro módulo). */
export interface EquipmentMaintenanceEquipmentRef {
  id: string;
  name: string;
  status: string;
}

export interface EquipmentMaintenanceSupplierRef {
  id: string;
  name: string;
}

export interface EquipmentMaintenanceRow {
  id: string;
  type: EquipmentMaintenanceType;
  status: EquipmentMaintenanceStatus;
  description: string;
  /** Fecha pura `YYYY-MM-DD`, o `null` (los correctivos normalmente no tienen). */
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  cost: number | null;
  next_maintenance_date: string | null;
  equipment_id: string;
  /** `null` si el equipo fue eliminado. */
  equipment: EquipmentMaintenanceEquipmentRef | null;
  supplier_id: string;
  /** `null` si el proveedor fue eliminado. */
  supplier: EquipmentMaintenanceSupplierRef | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EquipmentMaintenanceListParams {
  page?: number;
  perPage?: number;
  equipmentId?: string;
  supplierId?: string;
  type?: EquipmentMaintenanceType;
  status?: EquipmentMaintenanceStatus;
  /** `scheduled_date >=` (inclusive). Deja fuera los que no tienen `scheduled_date`. */
  dateFrom?: string;
  /** `scheduled_date <=` (inclusive). Deja fuera los que no tienen `scheduled_date`. */
  dateTo?: string;
}

/**
 * Cuerpo de `POST /equipment-maintenances`. `scheduled_date` es obligatoria
 * si `type` es `"preventivo"`; opcional si es `"correctivo"`.
 */
export interface CreateEquipmentMaintenanceInput {
  equipment_id: number;
  supplier_id: number;
  type: EquipmentMaintenanceType;
  description: string;
  scheduled_date?: string;
}

/**
 * Cuerpo de `PATCH /equipment-maintenances/{id}`. Solo válido si el
 * mantenimiento está `programado`; no admite `equipment_id` ni `type`.
 */
export interface UpdateEquipmentMaintenanceInput {
  supplier_id?: number;
  scheduled_date?: string;
  description?: string;
}

/** Cuerpo de `PATCH /equipment-maintenances/{id}/complete`. */
export interface CompleteEquipmentMaintenanceInput {
  cost: number;
  next_maintenance_date?: string;
}
