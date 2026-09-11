/** Fábrica de query-keys de React Query para roles y el catálogo de permisos. */
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
  catalog: () => [...permissionKeys.all, "catalog"] as const,
};
