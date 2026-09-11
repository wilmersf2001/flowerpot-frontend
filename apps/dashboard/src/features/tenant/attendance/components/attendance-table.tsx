"use client";

import { Trash2 } from "lucide-react";
import {
  DataTable,
  EM_DASH,
  RowActions,
  formatDate,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { AttendanceRow } from "../lib/attendance.types";

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const columns: Column<AttendanceRow>[] = [
  {
    key: "member_name",
    header: "Socio",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.member_name || row.member_id}</span>
        {row.member_dni ? (
          <span className="text-xs text-muted-foreground">{row.member_dni}</span>
        ) : null}
      </div>
    ),
  },
  {
    key: "checked_in_at",
    header: "Ingreso",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.checked_in_at, DATETIME_OPTIONS)}
      </span>
    ),
  },
  {
    key: "branch_name",
    header: "Sede",
    cell: (row) => (
      <span className="text-muted-foreground">{row.branch_name || EM_DASH}</span>
    ),
  },
  {
    key: "source",
    header: "Origen",
    cell: (row) => (
      <span className="text-muted-foreground">{row.source || EM_DASH}</span>
    ),
  },
  {
    key: "membership_ends_at",
    header: "Membresía vence",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">
        {row.membership_ends_at ? formatDate(row.membership_ends_at) : EM_DASH}
      </span>
    ),
  },
];

export function AttendanceTable({
  rows,
  isLoading,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay asistencias registradas.",
}: {
  rows: AttendanceRow[];
  isLoading: boolean;
  onDeleteAction: (attendance: AttendanceRow) => void;
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
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
