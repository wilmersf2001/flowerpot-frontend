"use client";

import { Eye, PackageCheck, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDate,
  formatMoney,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { useRestorePurchaseOrder } from "../lib/purchase-orders.hooks";
import type { PurchaseOrderRow } from "../lib/purchase-orders.types";

const STATUS_MAP: StatusMap = {
  pending: { label: "Pendiente", tone: "warning" },
  received: { label: "Recibida", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
};

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminada", tone: "danger" },
};

const baseColumns: Column<PurchaseOrderRow>[] = [
  {
    key: "order_date",
    header: "Fecha",
    cell: (row) => <span>{formatDate(row.order_date)}</span>,
  },
  {
    key: "supplier",
    header: "Proveedor",
    cell: (row) => <span className="text-muted-foreground">{row.supplier?.name ?? EM_DASH}</span>,
  },
  {
    key: "branch",
    header: "Sede",
    cell: (row) => <span className="text-muted-foreground">{row.branch?.name ?? EM_DASH}</span>,
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
];

export function PurchaseOrdersTable({
  rows,
  isLoading,
  onViewAction,
  onEditAction,
  onReceiveAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay órdenes de compra. Crea la primera.",
}: {
  rows: PurchaseOrderRow[];
  isLoading: boolean;
  onViewAction: (order: PurchaseOrderRow) => void;
  onEditAction: (order: PurchaseOrderRow) => void;
  onReceiveAction: (order: PurchaseOrderRow) => void;
  onDeleteAction: (order: PurchaseOrderRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const restoreOrder = useRestorePurchaseOrder();

  function handleRestore(order: PurchaseOrderRow) {
    restoreOrder.mutate(order.id, {
      onSuccess: () => toast.success("Orden de compra restaurada."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar la orden."),
    });
  }

  const columns: Column<PurchaseOrderRow>[] = [
    ...baseColumns,
    {
      key: "status",
      header: "Estado",
      cell: (row) =>
        row.deleted_at ? (
          <StatusBadge value={true} map={DELETED_MAP} />
        ) : (
          <StatusBadge value={row.status} map={STATUS_MAP} />
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => {
        const isDeleted = Boolean(row.deleted_at);
        const isPending = row.status === "pending" && !isDeleted;
        return (
          <RowActions
            label={`Acciones de la orden del ${formatDate(row.order_date)}`}
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => onViewAction(row) },
              isDeleted && {
                label: "Restaurar",
                icon: RotateCcw,
                disabled: restoreOrder.isPending && restoreOrder.variables === row.id,
                onSelect: () => handleRestore(row),
              },
              isPending && {
                label: "Editar",
                icon: Pencil,
                separatorBefore: true,
                onSelect: () => onEditAction(row),
              },
              isPending && {
                label: "Recibir",
                icon: PackageCheck,
                onSelect: () => onReceiveAction(row),
              },
              isPending && {
                label: "Eliminar",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => onDeleteAction(row),
              },
            ]}
          />
        );
      }}
    />
  );
}
