"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  type Column,
  type StatusMap,
} from "@/features/_shared";
import { InstructorScheduleRow } from "../lib/instructor-schedules.types";
import { DAY_OF_WEEK_LABELS } from "../lib/instructor-schedules.constants";
import { useRestoreInstructorSchedule } from "../lib/instructor-schedules.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

/** `HH:MM:SS` -> `HH:MM`. */
function formatTime(value: string): string {
  return value.slice(0, 5);
}

const baseColumns: Column<InstructorScheduleRow>[] = [
  {
    key: "day_of_week",
    header: "Día",
    cell: (row) => (
      <span className="font-medium">{DAY_OF_WEEK_LABELS[row.day_of_week] ?? EM_DASH}</span>
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
    key: "branch",
    header: "Sede",
    cell: (row) => <span className="text-muted-foreground">{row.branch?.name ?? EM_DASH}</span>,
  },
];

export function InstructorSchedulesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  emptyMessage = "Este instructor aún no tiene horarios registrados.",
}: {
  rows: InstructorScheduleRow[];
  isLoading: boolean;
  onEditAction: (schedule: InstructorScheduleRow) => void;
  onDeleteAction: (schedule: InstructorScheduleRow) => void;
  emptyMessage?: string;
}) {
  const restoreSchedule = useRestoreInstructorSchedule();

  function handleRestore(schedule: InstructorScheduleRow) {
    restoreSchedule.mutate(schedule.id);
  }

  const columns: Column<InstructorScheduleRow>[] = [
    ...baseColumns,
    {
      key: "status",
      header: "Estado",
      cell: (row) =>
        row.deleted_at ? <StatusBadge value={true} map={DELETED_MAP} /> : EM_DASH,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
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
