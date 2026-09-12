"use client";

import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { EXPENSE_STATUSES, EXPENSE_STATUS_LABELS } from "../lib/expenses.constants";
import type { ExpenseStatus } from "../lib/expenses.types";

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  ...EXPENSE_STATUSES.map((status) => ({ value: status, label: EXPENSE_STATUS_LABELS[status] })),
];

/** Filtro de estado sobre el listado de gastos. `""` = sin filtrar. */
export function ExpenseStatusFilter({
  value,
  onChangeAction,
}: {
  value: ExpenseStatus | "";
  onChangeAction: (value: ExpenseStatus | "") => void;
}) {
  return (
    <Combobox
      value={value}
      onValueChange={(next) => onChangeAction(next as ExpenseStatus | "")}
      options={STATUS_OPTIONS}
      className="w-48"
      placeholder="Estado"
    />
  );
}
