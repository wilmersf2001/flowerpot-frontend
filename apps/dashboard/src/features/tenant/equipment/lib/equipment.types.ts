// TODO(gen): `api.d.ts` todavía no tiene `EquipmentResource`. Se escribe a
// mano y se reemplaza al correr `npm run gen -w packages/types`.

import type { EQUIPMENT_STATUSES } from "./equipment.constants";

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface EquipmentCategoryRef {
  id: string;
  name: string;
}

export interface EquipmentBranchRef {
  id: string;
  name: string;
}

export interface EquipmentMaintenanceSupplierRef {
  id: string;
  name: string;
}

/**
 * Mantenimiento tal como viene embebido en el historial del detalle de un
 * equipo (`GET /equipment/{id}`). Es una copia local y liviana — el módulo de
 * mantenimientos tiene su propio `EquipmentMaintenanceRow` (con la referencia
 * inversa al equipo) para su propia pantalla.
 */
export interface EquipmentMaintenanceRef {
  id: string;
  type: "preventivo" | "correctivo";
  status: "programado" | "en_progreso" | "completado" | "cancelado";
  description: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  cost: number | null;
  next_maintenance_date: string | null;
  supplier_id: string;
  supplier: EquipmentMaintenanceSupplierRef | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  /** Fecha pura `YYYY-MM-DD`, o `null`. */
  purchase_date: string | null;
  purchase_cost: number | null;
  /** Fecha pura `YYYY-MM-DD`, o `null`. */
  warranty_expiration: string | null;
  status: EquipmentStatus;
  equipment_category_id: string | null;
  /** `null` si no tiene categoría (o esta fue eliminada). No viene en `store`. */
  category: EquipmentCategoryRef | null;
  branch_id: string;
  /** No viene en `store`. */
  branch: EquipmentBranchRef | null;
  /** Solo viene cargado en `show` (detalle). En listado y `store`/`update` es `[]`. */
  maintenances: EquipmentMaintenanceRef[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EquipmentListParams {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  branchId?: string;
  status?: EquipmentStatus;
}

/**
 * Cuerpo de `POST /equipment` (`StoreEquipmentRequest`). Sin `status`: el
 * formulario de alta lo deja en el valor por defecto del backend (`operativo`).
 */
export interface CreateEquipmentInput {
  equipment_category_id?: number | null;
  branch_id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  purchase_cost?: number | null;
  warranty_expiration?: string | null;
}

/** Cuerpo de `PATCH /equipment/{id}` (`UpdateEquipmentRequest`). */
export interface UpdateEquipmentInput {
  equipment_category_id?: number | null;
  branch_id?: number;
  name?: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  purchase_cost?: number | null;
  warranty_expiration?: string | null;
}
