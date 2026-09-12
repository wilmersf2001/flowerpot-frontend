"use client";

import { Ban, CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";
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
import { expensePaymentMethodLabel, formatSoles } from "../lib/expenses.constants";
import { ExpenseRow } from "../lib/expenses.types";

const EXPENSE_STATUS_MAP: StatusMap = {
  pending: { label: "Pendiente", tone: "warning" },
  approved: { label: "Aprobado", tone: "success" },
  rejected: { label: "Rechazado", tone: "danger" },
  voided: { label: "Anulado", tone: "neutral" },
};

const columns: Column<ExpenseRow>[] = [
  {
    key: "date",
    header: "Fecha",
    cell: (row) => <span className="tabular-nums text-muted-foreground">{formatDate(row.date)}</span>,
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.description}</span>
        <span className="text-xs text-muted-foreground">{row.category_name || EM_DASH}</span>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Monto",
    cell: (row) => <span className="tabular-nums">{formatSoles(row.amount)}</span>,
  },
  {
    key: "payment_method",
    header: "Método",
    cell: (row) => (
      <span className="text-muted-foreground">{expensePaymentMethodLabel(row.payment_method)}</span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={row.status} map={EXPENSE_STATUS_MAP} />,
  },
  {
    key: "registered_by_name",
    header: "Registrado por",
    cell: (row) => <span className="text-muted-foreground">{row.registered_by_name || EM_DASH}</span>,
  },
];

export function ExpensesTable({
  rows,
  isLoading,
  onEditAction,
  onReviewAction,
  onVoidAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay gastos registrados.",
}: {
  rows: ExpenseRow[];
  isLoading: boolean;
  onEditAction: (expense: ExpenseRow) => void;
  onReviewAction: (expense: ExpenseRow, action: "approve" | "reject") => void;
  onVoidAction: (expense: ExpenseRow) => void;
  onDeleteAction: (expense: ExpenseRow) => void;
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
      rowActions={(row) => {
        const isPending = row.status === "pending";
        const canVoid = row.status === "pending" || row.status === "approved";
        return (
          <RowActions
            label={`Acciones del gasto "${row.description}"`}
            actions={[
              isPending && {
                label: "Aprobar",
                icon: CheckCircle2,
                onSelect: () => onReviewAction(row, "approve"),
              },
              isPending && {
                label: "Rechazar",
                icon: XCircle,
                onSelect: () => onReviewAction(row, "reject"),
              },
              isPending && {
                label: "Editar",
                icon: Pencil,
                separatorBefore: true,
                onSelect: () => onEditAction(row),
              },
              canVoid && {
                label: "Anular",
                icon: Ban,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => onVoidAction(row),
              },
              isPending && {
                label: "Eliminar",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: !canVoid,
                onSelect: () => onDeleteAction(row),
              },
            ]}
          />
        );
      }}
    />
  );
}
