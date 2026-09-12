"use client";

import { Eye } from "lucide-react";
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
import { formatSoles } from "../lib/cash-register.constants";
import type { CashRegisterRow } from "../lib/cash-register.types";

const CASH_REGISTER_STATUS_MAP: StatusMap = {
  open: { label: "Abierta", tone: "success" },
  closed: { label: "Cerrada", tone: "neutral" },
};

const columns: Column<CashRegisterRow>[] = [
  {
    key: "opened_at",
    header: "Apertura",
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(row.opened_at, { dateStyle: "short", timeStyle: "short" })}
      </span>
    ),
  },
  {
    key: "closed_at",
    header: "Cierre",
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.closed_at ? formatDate(row.closed_at, { dateStyle: "short", timeStyle: "short" }) : EM_DASH}
      </span>
    ),
  },
  {
    key: "opening_amount",
    header: "Apertura",
    cell: (row) => <span className="tabular-nums">{formatSoles(row.opening_amount)}</span>,
  },
  {
    key: "closing_amount",
    header: "Cierre",
    cell: (row) => (
      <span className="tabular-nums">
        {row.closing_amount == null ? EM_DASH : formatSoles(row.closing_amount)}
      </span>
    ),
  },
  {
    key: "difference",
    header: "Diferencia",
    cell: (row) => {
      if (row.difference == null) return <span className="text-muted-foreground">{EM_DASH}</span>;
      const tone =
        row.difference > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : row.difference < 0
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground";
      return <span className={`tabular-nums ${tone}`}>{formatSoles(row.difference)}</span>;
    },
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={row.status} map={CASH_REGISTER_STATUS_MAP} />,
  },
];

export function CashRegistersHistoryTable({
  rows,
  isLoading,
  onViewAction,
  pagination,
  emptyMessage = "Aún no hay cajas registradas.",
}: {
  rows: CashRegisterRow[];
  isLoading: boolean;
  onViewAction: (register: CashRegisterRow) => void;
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
      rowActions={(row) => (
        <RowActions
          label={`Ver detalle de la caja del ${formatDate(row.opened_at)}`}
          actions={[{ label: "Ver detalle", icon: Eye, onSelect: () => onViewAction(row) }]}
        />
      )}
    />
  );
}
