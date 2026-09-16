"use client";

import { CalendarClock, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  formatDate,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { InstructorRow } from "../lib/instructors.types";
import { useRestoreInstructor, useToggleInstructorActive } from "../lib/instructors.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

const baseColumns: Column<InstructorRow>[] = [
  {
    key: "instructor",
    header: "Instructor",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.staff?.full_name || EM_DASH}</span>
        <span className="text-xs text-muted-foreground">{row.staff?.dni}</span>
      </div>
    ),
  },
  {
    key: "specialties",
    header: "Especialidades",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.specialties.length > 0
          ? row.specialties.map((specialty) => specialty.name).join(", ")
          : EM_DASH}
      </span>
    ),
  },
  {
    key: "tarifa_por_clase",
    header: "Tarifa/clase",
    cell: (row) => (
      <span className="text-muted-foreground">{row.tarifa_por_clase || EM_DASH}</span>
    ),
  },
  {
    key: "fecha_inicio",
    header: "Inicio",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.fecha_inicio ? formatDate(row.fecha_inicio) : EM_DASH}
      </span>
    ),
  },
];

export function InstructorsTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  onSchedulesAction,
  pagination,
  emptyMessage = "Aún no hay instructores registrados. Crea el primero.",
}: {
  rows: InstructorRow[];
  isLoading: boolean;
  onEditAction: (instructor: InstructorRow) => void;
  onDeleteAction: (instructor: InstructorRow) => void;
  onSchedulesAction: (instructor: InstructorRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleInstructorActive();
  const restoreInstructor = useRestoreInstructor();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(instructor: InstructorRow) {
    const name = instructor.staff?.full_name ?? "Instructor";
    toggleActive.mutate(instructor, {
      onSuccess: (updated) =>
        toast.success(updated.is_active ? `"${name}" activado.` : `"${name}" desactivado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : `No se pudo cambiar el estado de "${name}".`,
        ),
    });
  }

  function handleRestore(instructor: InstructorRow) {
    const name = instructor.staff?.full_name ?? "Instructor";
    restoreInstructor.mutate(instructor.id, {
      onSuccess: () => toast.success(`"${name}" restaurado.`),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : `No se pudo restaurar "${name}".`),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un instructor eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<InstructorRow>[] = [
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
              aria-label={`Activar a ${row.staff?.full_name ?? "instructor"}`}
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
            label={`Acciones de ${row.staff?.full_name ?? "instructor"}`}
            actions={[
              {
                label: "Horarios",
                icon: CalendarClock,
                onSelect: () => onSchedulesAction(row),
              },
              isDeleted
                ? {
                    label: "Restaurar",
                    icon: RotateCcw,
                    disabled: restoreInstructor.isPending && restoreInstructor.variables === row.id,
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
