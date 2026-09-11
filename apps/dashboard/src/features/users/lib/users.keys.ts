import { UserListParams } from "./users.types";

/** Fábrica de query-keys de React Query para el módulo de usuarios. */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
};
