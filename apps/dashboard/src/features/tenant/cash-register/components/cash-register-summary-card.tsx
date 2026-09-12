"use client";

import { formatSoles } from "../lib/cash-register.constants";
import type { CashRegisterRow, CashRegisterSummary } from "../lib/cash-register.types";

/** Tarjetas de balance/ingresos/egresos de la caja actual. */
export function CashRegisterSummaryCard({
  register,
  summary,
  isLoading,
}: {
  register: CashRegisterRow;
  summary: CashRegisterSummary | undefined;
  isLoading: boolean;
}) {
  const items = [
    { label: "Apertura", value: register.opening_amount },
    { label: "Ingresos", value: summary?.summary.total_income ?? 0, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Egresos", value: summary?.summary.total_expense ?? 0, tone: "text-red-600 dark:text-red-400" },
    { label: "Balance actual", value: register.current_balance, emphasis: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p
            className={`mt-1 text-lg font-semibold tabular-nums ${item.tone ?? ""} ${
              item.emphasis ? "text-foreground" : ""
            }`}
          >
            {isLoading ? "…" : formatSoles(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
