"use client";

import { CircleDollarSign, NotebookText, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  DataTable,
  RowActions,
  StatusBadge,
  formatDate,
  EM_DASH,
  type Column,
  type DataTablePagination,
  type StatusMap,
  type StatusStyle,
} from "@/features/_shared";
import {
  PAYMENT_GATEWAY_LABELS,
  PAYMENT_STATUS_LABELS,
  formatSoles,
} from "../lib/payments.constants";
import { PaymentRow, PaymentStatus } from "../lib/payments.types";

/** Estado del pago -> tono del badge (la etiqueta sale de `PAYMENT_STATUS_LABELS`). */
const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusStyle["tone"]> = {
  pending: "warning",
  completed: "success",
  partially_paid: "info",
  failed: "danger",
  refunded: "neutral",
};

const PAYMENT_STATUS_MAP: StatusMap = Object.fromEntries(
  Object.entries(PAYMENT_STATUS_TONES).map(([status, tone]) => [
    status,
    { label: PAYMENT_STATUS_LABELS[status as PaymentStatus], tone },
  ]),
);

const columns: Column<PaymentRow>[] = [
  {
    key: "member",
    header: "Socio",
    cell: (row) => (
      <div className="flex min-w-0 flex-col">
        <span className="font-medium">{row.member_name || row.member_id}</span>
        {/* Nota del cobro: una línea; el texto completo al pasar el mouse. */}
        {row.notes ? (
          <span
            className="max-w-56 truncate text-xs text-muted-foreground"
            title={row.notes}
          >
            {row.notes}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    key: "membership",
    header: "Membresía",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.membership_plan_name || row.membership_id}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Monto",
    cell: (row) => (
      <span className="tabular-nums">{formatSoles(row.amount)}</span>
    ),
  },
  {
    key: "amount_paid",
    header: "Pagado",
    cell: (row) => (
      <span className="tabular-nums">{formatSoles(row.amount_paid)}</span>
    ),
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
          label={`Acciones del pago de ${row.member?.full_name || row.member_id}`}
          // Cada acción aparece solo cuando la API la permite
          // (PaymentService / StoreInstallmentRequest / RefundPaymentRequest).
          actions={[
            row.balance_due > 0 &&
              row.gateway === "manual" &&
              (row.status === "pending" || row.status === "partially_paid") && {
                label: "Agregar abono",
                icon: CircleDollarSign,
                onSelect: () => onAddInstallmentAction(row),
              },
            // Completo, o abonos parciales manuales (Culqi no cobra en partes).
            (row.status === "completed" ||
              (row.status === "partially_paid" && row.gateway === "manual")) && {
              label: "Reembolsar",
              icon: RotateCcw,
              onSelect: () => onRefundAction(row),
            },
            {
              // En un reembolsado la nota guarda el registro de la devolución: solo se ve.
              label: row.status === "refunded" ? "Ver notas" : "Editar notas",
              icon: row.status === "refunded" ? NotebookText : Pencil,
              onSelect: () => onEditNotesAction(row),
            },
            row.status === "pending" && {
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
