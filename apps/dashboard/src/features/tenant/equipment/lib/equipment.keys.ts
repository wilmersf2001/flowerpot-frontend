import { EquipmentListParams } from "./equipment.types";

/** Fábrica de query-keys de React Query para el módulo de equipos. */
export const equipmentKeys = {
  all: ["equipment"] as const,
  lists: () => [...equipmentKeys.all, "list"] as const,
  list: (params: EquipmentListParams) => [...equipmentKeys.lists(), params] as const,
  details: () => [...equipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  options: (search: string) => [...equipmentKeys.all, "options", search] as const,
};
