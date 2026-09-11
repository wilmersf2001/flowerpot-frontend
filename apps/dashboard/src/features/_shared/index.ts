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
export { RowActions, type RowAction } from "./row-actions";
export {
  StatusBadge,
  ACTIVE_MAP,
  type StatusMap,
  type StatusStyle,
} from "./status-badge";
export { AppDialog } from "./app-dialog";
export {
  Field,
  TextField,
  TextareaField,
  useFieldBinder,
  type FieldBinding,
} from "./form-field";
export { DateField } from "./date-field";
export { ConfirmDialog } from "./confirm-dialog";
export { CopyRow } from "./copy-row";
export { SearchInput } from "./search-input";
export { useDebouncedValue } from "./use-debounced-value";
export {
  useAsyncOptions,
  type AsyncOptions,
  type UseAsyncOptionsConfig,
} from "./use-async-options";
export { AsyncCombobox, type AsyncComboboxProps } from "./async-combobox";
export { MultiCombobox, type MultiComboboxProps } from "./multi-combobox";
export {
  formatDate,
  toDateInputValue,
  splitLines,
  slugify,
  EM_DASH,
} from "./format";
export {
  requiredText,
  boundedText,
  optionalText,
  numericText,
  enumFallback,
} from "./form-schema";
export {
  useResourceFormSubmit,
  type ResourceFormSubmitConfig,
} from "./use-resource-form-submit";
