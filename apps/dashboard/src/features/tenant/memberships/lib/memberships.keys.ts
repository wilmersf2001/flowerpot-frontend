import { MembershipListParams } from "./memberships.types";

/** Fábrica de query-keys de React Query para el módulo de membresías. */
export const membershipKeys = {
  all: ["memberships"] as const,
  lists: () => [...membershipKeys.all, "list"] as const,
  list: (params: MembershipListParams) =>
    [...membershipKeys.lists(), params] as const,
};
