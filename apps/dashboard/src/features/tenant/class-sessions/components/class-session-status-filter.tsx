"use client";

import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { CLASS_SESSION_STATUSES, CLASS_SESSION_STATUS_LABELS } from "../lib/class-sessions.constants";
import type { ClassSessionStatus } from "../lib/class-sessions.types";

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  ...CLASS_SESSION_STATUSES.map((status) => ({ value: status, label: CLASS_SESSION_STATUS_LABELS[status] })),
];

/** Filtro de estado sobre el listado de sesiones. `""` = sin filtrar. */
export function ClassSessionStatusFilter({
  value,
  onChangeAction,
}: {
  value: ClassSessionStatus | "";
  onChangeAction: (value: ClassSessionStatus | "") => void;
}) {
  return (
    <Combobox
      value={value}
      onValueChange={(next) => onChangeAction(next as ClassSessionStatus | "")}
      options={STATUS_OPTIONS}
      className="w-44"
      placeholder="Estado"
    />
  );
}
