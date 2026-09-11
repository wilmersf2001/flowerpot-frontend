import { GymSettingsListParams } from "./gym-settings.types";

export const gymSettingsKeys = {
  all: ["gymSettings"] as const,
  lists: () => [...gymSettingsKeys.all, "list"] as const,
  list: (params: GymSettingsListParams) =>
    [...gymSettingsKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string) =>
    [...gymSettingsKeys.all, "options", search] as const,
};
