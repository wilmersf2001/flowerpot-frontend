"use client";

import { Pencil } from "lucide-react";
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
import { SubscriptionRow } from "../lib/subscriptions.types";

/** Estado de la suscripción -> tono y etiqueta del badge. */
const SUBSCRIPTION_STATUS_MAP: StatusMap = {
  active: { label: "Activa", tone: "success" },
  trial: { label: "Prueba", tone: "info" },
  cancelled: { label: "Cancelada", tone: "danger" },
  expired: { label: "Expirada", tone: "warning" },
};

const columns: Column<SubscriptionRow>[] = [
  {
    key: "tenant_id",
    header: "Gimnasio",
    cell: (row) => <span className="font-medium">{row.tenant_id}</span>,
  },
  {
    key: "plan_name",
    header: "Plan",
    cell: (row) => (
      <span className="text-muted-foreground">{row.plan_name}</span>
    ),
  },
  {
    key: "plan_price_formatted",
    header: "Precio",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.plan_price_formatted || EM_DASH}
      </span>
    ),
  },
  {
    key: "vigencia",
    header: "Vigencia",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.starts_at)} – {formatDate(row.ends_at)}
      </span>
    ),
  },
  {
    key: "days_remaining",
    header: "Días restantes",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {row.days_remaining ?? EM_DASH}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => (
      <StatusBadge value={row.status} map={SUBSCRIPTION_STATUS_MAP} />
    ),
  },
];

export function SubscriptionsTable({
  rows,
  isLoading,
  onEditAction,
  pagination,
  emptyMessage = "Aún no hay suscripciones. Crea la primera.",
}: {
  rows: SubscriptionRow[];
  isLoading: boolean;
  onEditAction: (subscription: SubscriptionRow) => void;
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
          label={`Acciones de ${row.tenant_id}`}
          actions={[
            {
              label: "Editar",
              icon: Pencil,
              onSelect: () => onEditAction(row),
            },
          ]}
        />
      )}
    />
  );
}
