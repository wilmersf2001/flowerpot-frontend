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
import { MembershipRow } from "../lib/memberships.types";

/** Estado de la membresía -> tono y etiqueta del badge. */
const MEMBERSHIP_STATUS_MAP: StatusMap = {
  active: { label: "Activa", tone: "success" },
  pending: { label: "Pendiente", tone: "info" },
  cancelled: { label: "Cancelada", tone: "danger" },
  expired: { label: "Expirada", tone: "warning" },
};

const columns: Column<MembershipRow>[] = [
  {
    key: "member_name",
    header: "Socio",
    cell: (row) => (
      <span className="font-medium">{row.member_name || row.member_id}</span>
    ),
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
        {row.is_expired ? EM_DASH : row.days_remaining}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => (
      <StatusBadge value={row.status} map={MEMBERSHIP_STATUS_MAP} />
    ),
  },
];

export function MembershipsTable({
  rows,
  isLoading,
  onEditAction,
  pagination,
  emptyMessage = "Aún no hay membresías. Crea la primera.",
}: {
  rows: MembershipRow[];
  isLoading: boolean;
  onEditAction: (membership: MembershipRow) => void;
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
          label={`Acciones de ${row.member_name || row.member_id}`}
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
