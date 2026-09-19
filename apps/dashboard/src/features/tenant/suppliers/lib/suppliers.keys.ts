import { SupplierListParams } from "./suppliers.types";

/** Fábrica de query-keys de React Query para el módulo de proveedores. */
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params: SupplierListParams) => [...supplierKeys.lists(), params] as const,
  options: (search: string) => [...supplierKeys.all, "options", search] as const,
};
