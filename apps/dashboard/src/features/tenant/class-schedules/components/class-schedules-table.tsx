"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { ClassScheduleRow } from "../lib/class-schedules.types";
import { useRestoreClassSchedule, useToggleClassScheduleActive } from "../lib/class-schedules.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

/** `HH:MM:SS` -> `HH:MM`. */
function formatTime(value: string): string {
  return value.slice(0, 5);
}

/** Cupo real: el override del horario o, si no hay, el de la clase. */
function effectiveCapacity(row: ClassScheduleRow): number | null {
  return row.max_capacity ?? row.gym_class?.max_capacity ?? row.effective_capacity ?? null;
}

const baseColumns: Column<ClassScheduleRow>[] = [
  {
    key: "gym_class",
    header: "Clase",
    cell: (row) => <span className="font-medium">{row.gym_class?.name ?? EM_DASH}</span>,
  },
  {
    key: "day",
    header: "Día",
    cell: (row) => <span className="text-muted-foreground">{row.day_label || EM_DASH}</span>,
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
    cell: (row) => <span className="text-muted-foreground">{row.branch?.name ?? EM_DASH}</span>,
  },
  {
    key: "capacity",
    header: "Cupo",
    cell: (row) => {
      const capacity = effectiveCapacity(row);
      return <span className="text-muted-foreground">{capacity ?? EM_DASH}</span>;
    },
  },
];

export function ClassSchedulesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Ningún horario coincide con el filtro.",
}: {
  rows: ClassScheduleRow[];
  isLoading: boolean;
  onEditAction: (schedule: ClassScheduleRow) => void;
  onDeleteAction: (schedule: ClassScheduleRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleClassScheduleActive();
  const restoreSchedule = useRestoreClassSchedule();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(schedule: ClassScheduleRow) {
    toggleActive.mutate(schedule, {
      onSuccess: (updated) =>
        toast.success(updated.is_active ? "Horario activado." : "Horario desactivado."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo cambiar el estado del horario."),
    });
  }

  function handleRestore(schedule: ClassScheduleRow) {
    restoreSchedule.mutate(schedule.id, {
      onSuccess: () => toast.success("Horario restaurado."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el horario."),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un horario eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<ClassScheduleRow>[] = [
    ...baseColumns,
    {
      key: "is_active",
      header: "Activo",
      cell: (row) =>
        row.deleted_at ? (
          <StatusBadge value={true} map={DELETED_MAP} />
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={row.is_active}
              disabled={pendingId === row.id}
              onCheckedChange={() => handleToggle(row)}
              aria-label="Activar horario"
            />
            <StatusBadge value={row.is_active} map={ACTIVE_MAP} />
          </div>
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
        return (
          <RowActions
            label="Acciones del horario"
            actions={[
              isDeleted
                ? {
                    label: "Restaurar",
                    icon: RotateCcw,
                    disabled: restoreSchedule.isPending && restoreSchedule.variables === row.id,
                    onSelect: () => handleRestore(row),
                  }
                : {
                    label: "Editar",
                    icon: Pencil,
                    onSelect: () => onEditAction(row),
                  },
              !isDeleted && {
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
