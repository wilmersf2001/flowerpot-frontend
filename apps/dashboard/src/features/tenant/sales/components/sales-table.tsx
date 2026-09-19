"use client";

import { Ban, Eye } from "lucide-react";
import {
  DataTable,
  RowActions,
  StatusBadge,
  formatDateTime,
  formatMoney,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { SALE_PAYMENT_METHOD_LABELS } from "../lib/sales.constants";
import type { SaleRow } from "../lib/sales.types";

const STATUS_MAP: StatusMap = {
  completed: { label: "Completada", tone: "success" },
  voided: { label: "Anulada", tone: "danger" },
};

const columns: Column<SaleRow>[] = [
  {
    key: "created_at",
    header: "Fecha",
    cell: (row) => <span>{formatDateTime(row.created_at)}</span>,
  },
  {
    key: "member",
    header: "Cliente",
    cell: (row) => <span className="text-muted-foreground">{row.member?.full_name ?? "Visitante"}</span>,
  },
  {
    key: "payment_method",
    header: "Pago",
    cell: (row) => (
      <div className="flex flex-col">
        <span>{SALE_PAYMENT_METHOD_LABELS[row.payment_method]}</span>
        {row.payment_reference ? (
          <span className="text-xs text-muted-foreground">{row.payment_reference}</span>
        ) : null}
      </div>
    ),
  },
  {
    key: "items",
    header: "Productos",
    cell: (row) => <span>{row.items.length} línea(s)</span>,
  },
  {
    key: "total",
    header: "Total",
    cell: (row) => <span className="font-medium tabular-nums">{formatMoney(row.total)}</span>,
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={row.status} map={STATUS_MAP} />,
  },
];

export function SalesTable({
  rows,
  isLoading,
  onViewAction,
  onVoidAction,
  pagination,
  emptyMessage = "Aún no hay ventas registradas.",
}: {
  rows: SaleRow[];
  isLoading: boolean;
  onViewAction: (sale: SaleRow) => void;
  onVoidAction: (sale: SaleRow) => void;
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
          label={`Acciones de la venta del ${formatDateTime(row.created_at)}`}
          actions={[
            { label: "Ver detalle", icon: Eye, onSelect: () => onViewAction(row) },
            row.status === "completed" && {
              label: "Anular",
              icon: Ban,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () => onVoidAction(row),
            },
          ]}
        />
      )}
    />
  );
}
