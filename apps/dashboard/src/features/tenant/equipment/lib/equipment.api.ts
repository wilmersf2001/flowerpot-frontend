import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { EQUIPMENT_ENDPOINT, EQUIPMENT_PER_PAGE } from "./equipment.constants";
import {
  CreateEquipmentInput,
  EquipmentListParams,
  EquipmentRow,
  UpdateEquipmentInput,
} from "./equipment.types";

async function list(
  params: EquipmentListParams = {},
): Promise<Paginated<EquipmentRow>> {
  const { data } = await apiClient.get<unknown>(EQUIPMENT_ENDPOINT, {
    params: buildListParams(params, EQUIPMENT_PER_PAGE),
  });
  return unwrapPaginated<EquipmentRow>(data);
}

/** Trae el equipo con categoría, sede e historial de mantenimientos. */
async function show(id: number): Promise<EquipmentRow> {
  const { data } = await apiClient.get<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return unwrapEnvelope<EquipmentRow>(data);
}

async function create(input: CreateEquipmentInput): Promise<EquipmentRow> {
  const { data } = await apiClient.post<unknown>(EQUIPMENT_ENDPOINT, input);
  return unwrapEnvelope<EquipmentRow>(data);
}

async function update(
  id: number,
  input: UpdateEquipmentInput,
): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<EquipmentRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un equipo eliminado (soft-delete). */
async function restore(id: number): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<EquipmentRow>(data);
}

/**
 * Da de baja el equipo (`status` -> `dado_de_baja`). Falla si tiene un
 * mantenimiento `programado` o `en_progreso` abierto. Sin body.
 */
async function decommission(id: number): Promise<EquipmentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_ENDPOINT}/${encodeURIComponent(id)}/decommission`,
  );
  return unwrapEnvelope<EquipmentRow>(data);
}

export const equipmentApi = {
  list,
  show,
  create,
  update,
  remove,
  restore,
  decommission,
};
