"use client";

import { Combobox, type ComboboxOption } from "@repo/ui/combobox";

const ACTIVE_FILTER_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

/** Filtro genérico de `is_active` sobre un listado. `""` = sin filtrar. */
export function ActiveFilter({
  value,
  onChangeAction,
  className = "w-40",
}: {
  value: "" | "true" | "false";
  onChangeAction: (value: "" | "true" | "false") => void;
  className?: string;
}) {
  return (
    <Combobox
      value={value}
      onValueChange={(next) => onChangeAction(next as "" | "true" | "false")}
      options={ACTIVE_FILTER_OPTIONS}
      className={className}
      placeholder="Estado"
    />
  );
}
