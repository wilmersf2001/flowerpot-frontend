"use client";

import { Undo2 } from "lucide-react";
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
import { useHasPermission } from "@/features/tenant/auth";
import { cashPaymentMethodLabel } from "@/features/tenant/cash-register/lib/cash-register.constants";
import { DAY_PASS_CHARGE_PERMISSION, VISIT_TYPE_LABELS } from "../lib/walk-in-visits.constants";
import type { WalkInVisitRow } from "../lib/walk-in-visits.types";

const REFUND_MAP: StatusMap = {
  true: { label: "Devuelta", tone: "danger" },
  false: { label: "Vigente", tone: "success" },
};

function personName(row: WalkInVisitRow): string {
  if (row.is_anonymous) return "Anónimo";
  return row.lead?.name ?? row.member?.full_name ?? row.member?.name ?? EM_DASH;
}

const columns: Column<WalkInVisitRow>[] = [
  {
    key: "visited_on",
    header: "Fecha",
    cell: (row) => <span className="text-muted-foreground">{formatDate(row.visited_on)}</span>,
  },
  {
    key: "person",
    header: "Visitante",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{personName(row)}</span>
        <span className="text-xs text-muted-foreground">
          {row.lead?.phone ?? (row.member_id ? "Ex socio" : EM_DASH)}
        </span>
      </div>
    ),
  },
  {
    key: "type",
    header: "Tipo",
    cell: (row) => VISIT_TYPE_LABELS[row.type],
  },
  {
    key: "amount",
    header: "Importe",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="tabular-nums">{formatMoney(row.amount)}</span>
        <span className="text-xs text-muted-foreground">{cashPaymentMethodLabel(row.payment_method)}</span>
      </div>
    ),
  },
  {
    key: "recorded_by",
    header: "Registró",
    cell: (row) => <span className="text-muted-foreground">{row.recorded_by?.name ?? EM_DASH}</span>,
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={Boolean(row.refunded_at)} map={REFUND_MAP} />,
  },
];

/** Libro de visitas. Solo el pase de día se devuelve aquí (la clase suelta, cancelando su inscripción). */
export function VisitsTable({
  rows,
  isLoading,
  onRefundAction,
  pagination,
  emptyMessage = "Aún no hay visitas registradas.",
}: {
  rows: WalkInVisitRow[];
  isLoading: boolean;
  onRefundAction: (visit: WalkInVisitRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const hasPermission = useHasPermission();
  const canRefund = hasPermission(DAY_PASS_CHARGE_PERMISSION);

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) =>
        canRefund && row.type === "day_pass" && !row.refunded_at ? (
          <RowActions
            label={`Acciones de la visita del ${formatDate(row.visited_on)}`}
            actions={[
              {
                label: "Devolver",
                icon: Undo2,
                variant: "destructive",
                onSelect: () => onRefundAction(row),
              },
            ]}
          />
        ) : null
      }
    />
  );
}
