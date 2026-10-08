import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  EQUIPMENT_CATEGORIES_ENDPOINT,
  EQUIPMENT_CATEGORIES_PER_PAGE,
} from "./equipment-categories.constants";
import {
  CreateEquipmentCategoryInput,
  EquipmentCategoryListParams,
  EquipmentCategoryRow,
  UpdateEquipmentCategoryInput,
} from "./equipment-categories.types";

async function list(
  params: EquipmentCategoryListParams = {},
): Promise<Paginated<EquipmentCategoryRow>> {
  const { data } = await apiClient.get<unknown>(EQUIPMENT_CATEGORIES_ENDPOINT, {
    params: buildListParams(params, EQUIPMENT_CATEGORIES_PER_PAGE),
  });
  return unwrapPaginated<EquipmentCategoryRow>(data);
}

async function create(
  input: CreateEquipmentCategoryInput,
): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.post<unknown>(
    EQUIPMENT_CATEGORIES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<EquipmentCategoryRow>(data);
}

async function update(
  id: number,
  input: UpdateEquipmentCategoryInput,
): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<EquipmentCategoryRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura una categoría eliminada (soft-delete). */
async function restore(id: number): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<EquipmentCategoryRow>(data);
}

export const equipmentCategoriesApi = { list, create, update, remove, restore };
