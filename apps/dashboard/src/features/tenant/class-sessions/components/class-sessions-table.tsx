"use client";

import { Pencil } from "lucide-react";
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
import { ClassSessionRow } from "../lib/class-sessions.types";

/** Estado de la sesión -> tono y etiqueta del badge. */
const CLASS_SESSION_STATUS_MAP: StatusMap = {
  scheduled: { label: "Programada", tone: "info" },
  cancelled: { label: "Cancelada", tone: "danger" },
  completed: { label: "Completada", tone: "success" },
};

/** `HH:MM:SS` -> `HH:MM`. */
function formatTime(value: string): string {
  return value.slice(0, 5);
}

const columns: Column<ClassSessionRow>[] = [
  {
    key: "gym_class",
    header: "Clase",
    cell: (row) => (
      <span className="font-medium">{row.class_schedule?.gym_class?.name ?? EM_DASH}</span>
    ),
  },
  {
    key: "session_date",
    header: "Fecha",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">{formatDate(row.session_date)}</span>
    ),
  },
  {
    key: "hours",
    header: "Horario",
    cell: (row) => (
      <span className="text-muted-foreground">
        {formatTime(row.start_time)} – {formatTime(row.end_time)}
      </span>
    ),
  },
  {
    key: "instructor",
    header: "Instructor",
    cell: (row) => (
      <span className="text-muted-foreground">{row.instructor?.staff?.full_name ?? EM_DASH}</span>
    ),
  },
  {
    key: "branch",
    header: "Sede",
    cell: (row) => (
      <span className="text-muted-foreground">{row.class_schedule?.branch?.name ?? EM_DASH}</span>
    ),
  },
  {
    key: "max_capacity",
    header: "Cupo",
    cell: (row) => <span className="text-muted-foreground">{row.max_capacity}</span>,
  },
  {
    key: "status",
    header: "Estado",
    cell: (row) => <StatusBadge value={row.status} map={CLASS_SESSION_STATUS_MAP} />,
  },
];

export function ClassSessionsTable({
  rows,
  isLoading,
  onEditAction,
  pagination,
  emptyMessage = "Ninguna sesión coincide con el filtro.",
}: {
  rows: ClassSessionRow[];
  isLoading: boolean;
  onEditAction: (session: ClassSessionRow) => void;
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
          label="Acciones de la sesión"
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
