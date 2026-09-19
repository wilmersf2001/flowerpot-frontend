import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
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

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toEquipmentCategoryRow(raw: Record<string, unknown>): EquipmentCategoryRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(
  params: EquipmentCategoryListParams = {},
): Promise<Paginated<EquipmentCategoryRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(EQUIPMENT_CATEGORIES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? EQUIPMENT_CATEGORIES_PER_PAGE,
      search: search ? search : undefined,
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toEquipmentCategoryRow) };
}

async function create(input: CreateEquipmentCategoryInput): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.post<unknown>(EQUIPMENT_CATEGORIES_ENDPOINT, input);
  return toEquipmentCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateEquipmentCategoryInput,
): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toEquipmentCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una categoría eliminada (soft-delete). */
async function restore(id: string): Promise<EquipmentCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${EQUIPMENT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toEquipmentCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const equipmentCategoriesApi = { list, create, update, remove, restore };
