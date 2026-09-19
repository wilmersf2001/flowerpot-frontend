"use client";

import { DataTable, EM_DASH, StatusBadge, formatDateTime, type Column, type DataTablePagination, type StatusMap } from "@/features/_shared";
import type { StockMovementRow } from "../lib/stock-movements.types";

const TYPE_MAP: StatusMap = {
  compra: { label: "Compra", tone: "success" },
  venta: { label: "Venta", tone: "danger" },
  anulacion_venta: { label: "Anulación de venta", tone: "info" },
  ajuste: { label: "Ajuste", tone: "warning" },
};

/** Último segmento de `reference_type` (`App\Models\Tenant\Sale` -> `Sale`) para mostrar un texto corto. */
function referenceLabel(row: StockMovementRow): string {
  if (!row.reference_type || !row.reference_id) return EM_DASH;
  const model = row.reference_type.split("\\").pop();
  if (model === "PurchaseOrder") return `Orden de compra #${row.reference_id}`;
  if (model === "Sale") return `Venta #${row.reference_id}`;
  return `${model ?? "Referencia"} #${row.reference_id}`;
}

const columns: Column<StockMovementRow>[] = [
  {
    key: "created_at",
    header: "Fecha",
    cell: (row) => <span className="text-muted-foreground">{formatDateTime(row.created_at)}</span>,
  },
  {
    key: "product",
    header: "Producto",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.product?.name ?? EM_DASH}</span>
        {row.product ? <span className="text-xs text-muted-foreground">{row.product.sku}</span> : null}
      </div>
    ),
  },
  {
    key: "branch",
    header: "Sede",
    cell: (row) => <span className="text-muted-foreground">{row.branch?.name ?? EM_DASH}</span>,
  },
  {
    key: "type",
    header: "Tipo",
    cell: (row) => <StatusBadge value={row.type} map={TYPE_MAP} />,
  },
  {
    key: "quantity",
    header: "Cantidad",
    cell: (row) => (
      <span
        className={`font-medium tabular-nums ${row.quantity < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
      </span>
    ),
  },
  {
    key: "reference",
    header: "Origen",
    cell: (row) => <span className="text-muted-foreground">{referenceLabel(row)}</span>,
  },
];

export function StockMovementsTable({
  rows,
  isLoading,
  pagination,
  emptyMessage = "Sin movimientos de stock.",
}: {
  rows: StockMovementRow[];
  isLoading: boolean;
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
    />
  );
}
