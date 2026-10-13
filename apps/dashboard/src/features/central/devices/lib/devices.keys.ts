import type { DeviceListParams } from "./devices.types";

/** Fábrica de query-keys de React Query para el módulo de lectores. */
export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams) => [...deviceKeys.lists(), params] as const,
};
