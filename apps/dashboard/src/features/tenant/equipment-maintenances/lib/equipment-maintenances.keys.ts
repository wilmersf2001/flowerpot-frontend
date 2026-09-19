import { EquipmentMaintenanceListParams } from "./equipment-maintenances.types";

/** Fábrica de query-keys de React Query para el módulo de mantenimientos de equipo. */
export const equipmentMaintenanceKeys = {
  all: ["equipment-maintenances"] as const,
  lists: () => [...equipmentMaintenanceKeys.all, "list"] as const,
  list: (params: EquipmentMaintenanceListParams) =>
    [...equipmentMaintenanceKeys.lists(), params] as const,
};
