import type { ManagementParams } from "./management.types";

export const managementKeys = {
  all: ["analytics", "management"] as const,
  panel: (panel: string, params: ManagementParams) =>
    [...managementKeys.all, panel, params] as const,
};
