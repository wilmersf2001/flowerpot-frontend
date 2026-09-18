"use client";

import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { DAY_OF_WEEK_OPTIONS } from "../lib/class-schedules.constants";

const DAY_FILTER_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los días" },
  ...DAY_OF_WEEK_OPTIONS.map((day) => ({ value: day.value, label: day.label })),
];

/** Filtro de día de la semana sobre el listado de horarios. `""` = sin filtrar. */
export function ClassScheduleDayFilter({
  value,
  onChangeAction,
}: {
  value: string;
  onChangeAction: (value: string) => void;
}) {
  return (
    <Combobox
      value={value}
      onValueChange={onChangeAction}
      options={DAY_FILTER_OPTIONS}
      className="w-40"
      placeholder="Día"
    />
  );
}
