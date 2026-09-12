"use client";

import { Ban, TrendingDown, TrendingUp } from "lucide-react";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDate,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { cashCategoryLabel, cashPaymentMethodLabel, formatSoles } from "../lib/cash-register.constants";
import type { CashMovementRow } from "../lib/cash-register.types";

const VOIDED_MAP: StatusMap = {
  true: { label: "Anulado", tone: "danger" },
};

const columns: Column<CashMovementRow>[] = [
  {
    key: "movement_at",
    header: "Fecha",
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(row.movement_at, { dateStyle: "short", timeStyle: "short" })}
      </span>
    ),
  },
  {
    key: "type",
    header: "Tipo",
    cell: (row) =>
      row.type === "income" ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-4" /> Ingreso
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
          <TrendingDown className="size-4" /> Egreso
        </span>
      ),
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.description}</span>
        <span className="text-xs text-muted-foreground">
          {cashCategoryLabel(row.category)}
          {row.is_automatic ? " · automático" : ""}
        </span>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Monto",
    cell: (row) => (
      <span className={`tabular-nums ${row.type === "income" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {row.type === "expense" ? "-" : "+"}
        {formatSoles(row.amount)}
      </span>
    ),
  },
  {
    key: "payment_method",
    header: "Método",
    cell: (row) => (
      <span className="text-muted-foreground">{cashPaymentMethodLabel(row.payment_method)}</span>
    ),
  },
  {
    key: "recorded_by_name",
    header: "Registrado por",
    cell: (row) => <span className="text-muted-foreground">{row.recorded_by_name || EM_DASH}</span>,
  },
  {
    key: "is_voided",
    header: "Estado",
    cell: (row) => (row.is_voided ? <StatusBadge value={true} map={VOIDED_MAP} /> : EM_DASH),
  },
];

export function CashMovementsTable({
  rows,
  isLoading,
  onVoidAction,
  pagination,
  emptyMessage = "Aún no hay movimientos registrados.",
}: {
  rows: CashMovementRow[];
  isLoading: boolean;
  onVoidAction?: (movement: CashMovementRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={
        onVoidAction
          ? (row) => (
              <RowActions
                label={`Acciones del movimiento "${row.description}"`}
                actions={[
                  !row.is_voided && {
                    label: "Anular",
                    icon: Ban,
                    variant: "destructive",
                    onSelect: () => onVoidAction(row),
                  },
                ]}
              />
            )
          : undefined
      }
    />
  );
}
