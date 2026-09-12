"use client";

import { CircleDollarSign, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  DataTable,
  RowActions,
  StatusBadge,
  formatDate,
  EM_DASH,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { PAYMENT_GATEWAY_LABELS, formatSoles } from "../lib/payments.constants";
import { PaymentRow } from "../lib/payments.types";

/** Estado del pago -> tono y etiqueta del badge. Valores desconocidos caen a neutro. */
const PAYMENT_STATUS_MAP: StatusMap = {
  paid: { label: "Pagado", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  partial: { label: "Parcial", tone: "info" },
  refunded: { label: "Reembolsado", tone: "neutral" },
  failed: { label: "Fallido", tone: "danger" },
  cancelled: { label: "Cancelado", tone: "danger" },
};

const columns: Column<PaymentRow>[] = [
  {
    key: "member_name",
    header: "Socio",
    cell: (row) => (
      <span className="font-medium">{row.member_name || row.member_id}</span>
    ),
  },
  {
    key: "plan_name",
    header: "Membresía",
    cell: (row) => (
      <span className="text-muted-foreground">{row.plan_name || row.membership_id}</span>
    ),
  },
  {
    key: "amount",
    header: "Monto",
    cell: (row) => <span className="tabular-nums">{formatSoles(row.amount)}</span>,
  },
  {
    key: "amount_paid",
    header: "Pagado",
    cell: (row) => <span className="tabular-nums">{formatSoles(row.amount_paid)}</span>,
  },
  {
    key: "balance_due",
    header: "Saldo",
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {formatSoles(row.balance_due)}
      </span>
    ),
  },
  {
    key: "gateway",
    header: "Canal",
    cell: (row) => (
      <span className="text-muted-foreground">
        {PAYMENT_GATEWAY_LABELS[row.gateway] ?? row.gateway}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={row.status} map={PAYMENT_STATUS_MAP} />,
  },
  {
    key: "paid_at",
    header: "Fecha de pago",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {row.paid_at ? formatDate(row.paid_at) : EM_DASH}
      </span>
    ),
  },
];

export function PaymentsTable({
  rows,
  isLoading,
  onEditNotesAction,
  onAddInstallmentAction,
  onRefundAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay pagos registrados.",
}: {
  rows: PaymentRow[];
  isLoading: boolean;
  onEditNotesAction: (payment: PaymentRow) => void;
  onAddInstallmentAction: (payment: PaymentRow) => void;
  onRefundAction: (payment: PaymentRow) => void;
  onDeleteAction: (payment: PaymentRow) => void;
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
          label={`Acciones del pago de ${row.member_name || row.member_id}`}
          actions={[
            row.balance_due > 0 &&
              row.status !== "refunded" && {
                label: "Agregar abono",
                icon: CircleDollarSign,
                onSelect: () => onAddInstallmentAction(row),
              },
            row.amount_paid > 0 &&
              row.status !== "refunded" && {
                label: "Reembolsar",
                icon: RotateCcw,
                onSelect: () => onRefundAction(row),
              },
            {
              label: "Editar notas",
              icon: Pencil,
              onSelect: () => onEditNotesAction(row),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
