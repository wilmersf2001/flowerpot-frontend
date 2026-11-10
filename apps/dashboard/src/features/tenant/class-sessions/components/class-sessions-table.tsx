"use client";

import { Pencil, Users } from "lucide-react";
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

/** El cupo abre la lista de inscritos cuando el usuario puede verla. */
function buildColumns(
  onEnrollments?: (session: ClassSessionRow) => void,
): Column<ClassSessionRow>[] {
  return [
    {
      key: "gym_class",
      header: "Clase",
      cell: (row) => (
        <span className="font-medium">
          {row.class_schedule?.gym_class?.name ?? EM_DASH}
        </span>
      ),
    },
    {
      key: "session_date",
      header: "Fecha",
      cell: (row) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDate(row.session_date)}
        </span>
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
        <span className="text-muted-foreground">
          {row.instructor?.staff?.full_name ?? EM_DASH}
        </span>
      ),
    },
    {
      key: "branch",
      header: "Sede",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.class_schedule?.branch?.name ?? EM_DASH}
        </span>
      ),
    },
    {
      key: "max_capacity",
      header: "Cupo",
      cell: (row) => (
        <div className="flex flex-col items-start">
          {onEnrollments ? (
            <button
              type="button"
              className="tabular-nums underline-offset-2 hover:underline"
              onClick={() => onEnrollments(row)}
            >
              {row.enrolled_count ?? 0}/{row.max_capacity} inscritos
            </button>
          ) : (
            <span className="text-muted-foreground tabular-nums">
              {row.enrolled_count ?? 0}/{row.max_capacity} inscritos
            </span>
          )}
          {row.waitlist_count ? (
            <span className="text-xs text-amber-600">
              {row.waitlist_count} en espera
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => (
        <StatusBadge value={row.status} map={CLASS_SESSION_STATUS_MAP} />
      ),
    },
  ];
}

export function ClassSessionsTable({
  rows,
  isLoading,
  onEditAction,
  onEnrollmentsAction,
  pagination,
  emptyMessage = "Ninguna sesión coincide con el filtro.",
}: {
  rows: ClassSessionRow[];
  isLoading: boolean;
  onEditAction: (session: ClassSessionRow) => void;
  /** Abre inscritos / lista de espera; si se omite, la acción no se muestra. */
  onEnrollmentsAction?: (session: ClassSessionRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  return (
    <DataTable
      columns={buildColumns(onEnrollmentsAction)}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => (
        <RowActions
          label="Acciones de la sesión"
          actions={[
            onEnrollmentsAction && {
              label: "Inscritos",
              icon: Users,
              onSelect: () => onEnrollmentsAction(row),
            },
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
