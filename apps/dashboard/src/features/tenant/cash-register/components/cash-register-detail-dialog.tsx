"use client";

import { useState } from "react";
import { AppDialog, formatDate } from "@/features/_shared";
import { useCashRegisterHistoryMovements, useCashRegisterHistorySummary } from "../lib/cash-register.hooks";
import { formatSoles } from "../lib/cash-register.constants";
import { CashMovementsTable } from "./cash-movements-table";
import { VoidCashMovementDialog } from "./void-cash-movement-dialog";
import type { CashMovementRow, CashRegisterRow } from "../lib/cash-register.types";

/**
 * Detalle de una caja histórica: resumen + movimientos. Se puede anular un
 * movimiento aunque la caja esté cerrada — el backend exige
 * `cash_register.view_history` para eso y responde 403 si falta.
 */
export function CashRegisterDetailDialog({
  register,
  onOpenChangeAction,
}: {
  register: CashRegisterRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = register !== null;
  const summary = useCashRegisterHistorySummary(register?.id ?? null);
  const movements = useCashRegisterHistoryMovements(register?.id ?? null);
  const [voiding, setVoiding] = useState<CashMovementRow | null>(null);

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={onOpenChangeAction}
        className="max-w-3xl"
        title={register ? `Caja del ${formatDate(register.opened_at)}` : ""}
        description={
          register?.closed_at
            ? `Cerrada el ${formatDate(register.closed_at)}.`
            : "Caja aún abierta."
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Apertura", value: register?.opening_amount ?? 0 },
              { label: "Ingresos", value: summary.data?.summary.total_income ?? 0 },
              { label: "Egresos", value: summary.data?.summary.total_expense ?? 0 },
              {
                label: "Cierre",
                value: register?.closing_amount ?? register?.current_balance ?? 0,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {summary.isLoading ? "…" : formatSoles(item.value)}
                </p>
              </div>
            ))}
          </div>

          <CashMovementsTable
            rows={movements.data?.data ?? []}
            isLoading={movements.isPending}
            onVoidAction={setVoiding}
            emptyMessage="Sin movimientos en esta caja."
          />
        </div>
      </AppDialog>

      <VoidCashMovementDialog
        movement={voiding}
        onOpenChangeAction={(next) => {
          if (!next) setVoiding(null);
        }}
      />
    </>
  );
}
