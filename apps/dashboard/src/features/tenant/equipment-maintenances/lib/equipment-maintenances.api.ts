import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  EQUIPMENT_MAINTENANCES_ENDPOINT,
  EQUIPMENT_MAINTENANCES_PER_PAGE,
} from "./equipment-maintenances.constants";
import {
  CompleteEquipmentMaintenanceInput,
  CreateEquipmentMaintenanceInput,
  EquipmentMaintenanceEquipmentRef,
  EquipmentMaintenanceListParams,
  EquipmentMaintenanceRow,
  EquipmentMaintenanceSupplierRef,
  UpdateEquipmentMaintenanceInput,
} from "./equipment-maintenances.types";

function toEquipmentRef(raw: unknown): EquipmentMaintenanceEquipmentRef | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  return { id: String(e.id), name: String(e.name ?? ""), status: String(e.status ?? "") };
}

function toSupplierRef(raw: unknown): EquipmentMaintenanceSupplierRef | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  return { id: String(s.id), name: String(s.name ?? "") };
}

/** `cost` llega `null` hasta completarse (un costo `0` también llega como `null`). */
function toEquipmentMaintenanceRow(raw: Record<string, unknown>): EquipmentMaintenanceRow {
  return {
    id: String(raw.id),
    type: (raw.type as EquipmentMaintenanceRow["type"]) ?? "preventivo",
    status: (raw.status as EquipmentMaintenanceRow["status"]) ?? "programado",
    description: String(raw.description ?? ""),
    scheduled_date: raw.scheduled_date == null ? null : String(raw.scheduled_date),
    started_at: raw.started_at == null ? null : String(raw.started_at),
    completed_at: raw.completed_at == null ? null : String(raw.completed_at),
    cost: raw.cost == null ? null : Number(raw.cost),
    next_maintenance_date:
      raw.next_maintenance_date == null ? null : String(raw.next_maintenance_date),
    equipment_id: String(raw.equipment_id),
    equipment: toEquipmentRef(raw.equipment),
    supplier_id: String(raw.supplier_id),
    supplier: toSupplierRef(raw.supplier),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(
  params: EquipmentMaintenanceListParams = {},
): Promise<Paginated<EquipmentMaintenanceRow>> {
  const { data } = await apiClient.get<unknown>(EQUIPMENT_MAINTENANCES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? EQUIPMENT_MAINTENANCES_PER_PAGE,
      equipment_id: params.equipmentId || undefined,
      supplier_id: params.supplierId || undefined,
      type: params.type || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toEquipmentMaintenanceRow) };
}

async function show(id: string): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.get<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function create(
  input: CreateEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.post<unknown>(EQUIPMENT_MAINTENANCES_ENDPOINT, input);
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Solo permitido si el mantenimiento está `programado`. */
async function update(
  id: string,
  input: UpdateEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Soft delete. El backend no valida el estado ni revierte el estado del equipo. */
async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un mantenimiento eliminado (soft-delete). */
async function restore(id: string): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** `programado -> en_progreso`. Pone el equipo en `en_mantenimiento`. Sin body. */
async function start(id: string): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/start`,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** `en_progreso -> completado`. Devuelve el equipo a `operativo`. */
async function complete(
  id: string,
  input: CompleteEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/complete`,
    input,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** `programado -> cancelado`. No modifica el estado del equipo. Sin body. */
async function cancel(id: string): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/cancel`,
  );
  return toEquipmentMaintenanceRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const equipmentMaintenancesApi = {
  list,
  show,
  create,
  update,
  remove,
  restore,
  start,
  complete,
  cancel,
};
