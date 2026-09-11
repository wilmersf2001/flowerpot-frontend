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
import { JobPositionRow } from "../lib/job-positions.types";
import { useRestoreJobPosition, useToggleJobPositionActive } from "../lib/job-positions.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

const baseColumns: Column<JobPositionRow>[] = [
  {
    key: "name",
    header: "Cargo",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => (
      <span className="text-muted-foreground">{row.description || EM_DASH}</span>
    ),
  },
  {
    key: "staff_count",
    header: "Personal",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.staff_count ?? EM_DASH}
      </span>
    ),
  },
];

export function JobPositionsTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay cargos. Crea el primero.",
}: {
  rows: JobPositionRow[];
  isLoading: boolean;
  onEditAction: (jobPosition: JobPositionRow) => void;
  onDeleteAction: (jobPosition: JobPositionRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleJobPositionActive();
  const restoreJobPosition = useRestoreJobPosition();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(jobPosition: JobPositionRow) {
    toggleActive.mutate(jobPosition, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Cargo "${jobPosition.name}" activado.`
            : `Cargo "${jobPosition.name}" desactivado.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${jobPosition.name}".`,
        ),
    });
  }

  function handleRestore(jobPosition: JobPositionRow) {
    restoreJobPosition.mutate(jobPosition.id, {
      onSuccess: () => toast.success(`Cargo "${jobPosition.name}" restaurado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo restaurar "${jobPosition.name}".`,
        ),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un cargo eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<JobPositionRow>[] = [
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
              aria-label={`Activar cargo ${row.name}`}
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
                    disabled: restoreJobPosition.isPending && restoreJobPosition.variables === row.id,
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
