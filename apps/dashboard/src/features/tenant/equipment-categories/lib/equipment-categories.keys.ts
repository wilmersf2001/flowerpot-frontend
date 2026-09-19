import { EquipmentCategoryListParams } from "./equipment-categories.types";

/** Fábrica de query-keys de React Query para el módulo de categorías de equipo. */
export const equipmentCategoryKeys = {
  all: ["equipment-categories"] as const,
  lists: () => [...equipmentCategoryKeys.all, "list"] as const,
  list: (params: EquipmentCategoryListParams) =>
    [...equipmentCategoryKeys.lists(), params] as const,
  options: (search: string) => [...equipmentCategoryKeys.all, "options", search] as const,
};
