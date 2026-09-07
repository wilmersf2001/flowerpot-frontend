/**
 * Kit compartido de los módulos del dashboard (nivel app).
 * Las primitivas visuales puras viven en `@repo/ui`; aquí va el pegamento.
 */
export {
  DataTable,
  type Column,
  type DataTablePagination,
} from "./data-table";
export { ResourceHeader } from "./resource-header";
export { ConfirmDialog } from "./confirm-dialog";
export { SearchInput } from "./search-input";
export { useDebouncedValue } from "./use-debounced-value";
