"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { GymClassRow } from "../lib/gym-classes.types";
import { useRestoreGymClass, useToggleGymClassActive } from "../lib/gym-classes.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminada", tone: "danger" },
};

const baseColumns: Column<GymClassRow>[] = [
  {
    key: "name",
    header: "Clase",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        {row.specialty ? (
          <span className="text-xs text-muted-foreground">{row.specialty.name}</span>
        ) : null}
      </div>
    ),
  },
  {
    key: "duration_minutes",
    header: "Duración",
    cell: (row) => <span className="text-muted-foreground">{row.duration_minutes} min</span>,
  },
  {
    key: "max_capacity",
    header: "Cupo",
    cell: (row) => <span className="text-muted-foreground">{row.max_capacity}</span>,
  },
];

export function GymClassesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay clases. Crea la primera.",
}: {
  rows: GymClassRow[];
  isLoading: boolean;
  onEditAction: (gymClass: GymClassRow) => void;
  onDeleteAction: (gymClass: GymClassRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleGymClassActive();
  const restoreGymClass = useRestoreGymClass();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(gymClass: GymClassRow) {
    toggleActive.mutate(gymClass, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Clase "${gymClass.name}" activada.`
            : `Clase "${gymClass.name}" desactivada.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${gymClass.name}".`,
        ),
    });
  }

  function handleRestore(gymClass: GymClassRow) {
    restoreGymClass.mutate(gymClass.id, {
      onSuccess: () => toast.success(`Clase "${gymClass.name}" restaurada.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : `No se pudo restaurar "${gymClass.name}".`,
        ),
    });
  }

  // La columna "Activa" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Una clase eliminada no se
  // puede (des)activar: se ve solo el badge "Eliminada".
  const columns: Column<GymClassRow>[] = [
    ...baseColumns,
    {
      key: "is_active",
      header: "Activa",
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
              aria-label={`Activar clase ${row.name}`}
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
            label={`Acciones de ${row.name}`}
            actions={[
              isDeleted
                ? {
                    label: "Restaurar",
                    icon: RotateCcw,
                    disabled: restoreGymClass.isPending && restoreGymClass.variables === row.id,
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
