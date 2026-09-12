import { MembershipListParams } from "./memberships.types";

/** Fábrica de query-keys de React Query para el módulo de membresías. */
export const membershipKeys = {
  all: ["memberships"] as const,
  lists: () => [...membershipKeys.all, "list"] as const,
  list: (params: MembershipListParams) =>
    [...membershipKeys.lists(), params] as const,
  /** Combobox asíncrono: list paginado por scroll, keyeado por texto. */
  options: (search: string) => [...membershipKeys.all, "options", search] as const,
};
