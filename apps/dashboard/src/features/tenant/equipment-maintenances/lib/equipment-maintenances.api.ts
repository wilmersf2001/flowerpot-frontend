import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  EQUIPMENT_MAINTENANCES_ENDPOINT,
  EQUIPMENT_MAINTENANCES_PER_PAGE,
} from "./equipment-maintenances.constants";
import {
  CompleteEquipmentMaintenanceInput,
  CreateEquipmentMaintenanceInput,
  EquipmentMaintenanceListParams,
  EquipmentMaintenanceRow,
  UpdateEquipmentMaintenanceInput,
} from "./equipment-maintenances.types";

async function list(
  params: EquipmentMaintenanceListParams = {},
): Promise<Paginated<EquipmentMaintenanceRow>> {
  const { data } = await apiClient.get<unknown>(
    EQUIPMENT_MAINTENANCES_ENDPOINT,
    {
      params: buildListParams(params, EQUIPMENT_MAINTENANCES_PER_PAGE),
    },
  );
  return unwrapPaginated<EquipmentMaintenanceRow>(data);
}

async function show(id: number): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.get<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

async function create(
  input: CreateEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.post<unknown>(
    EQUIPMENT_MAINTENANCES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

/** Solo permitido si el mantenimiento está `programado`. */
async function update(
  id: number,
  input: UpdateEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

/** Soft delete. El backend no valida el estado ni revierte el estado del equipo. */
async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura un mantenimiento eliminado (soft-delete). */
async function restore(id: number): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

/** `programado -> en_progreso`. Pone el equipo en `en_mantenimiento`. Sin body. */
async function start(id: number): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/start`,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

/** `en_progreso -> completado`. Devuelve el equipo a `operativo`. */
async function complete(
  id: number,
  input: CompleteEquipmentMaintenanceInput,
): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/complete`,
    input,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
}

/** `programado -> cancelado`. No modifica el estado del equipo. Sin body. */
async function cancel(id: number): Promise<EquipmentMaintenanceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_MAINTENANCES_ENDPOINT}/${encodeURIComponent(id)}/cancel`,
  );
  return unwrapEnvelope<EquipmentMaintenanceRow>(data);
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
