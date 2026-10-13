import type { DeviceListParams } from "./devices.types";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams) => [...deviceKeys.lists(), params] as const,
};
