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
import { SpecialtyRow } from "../lib/specialties.types";
import { useRestoreSpecialty, useToggleSpecialtyActive } from "../lib/specialties.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminada", tone: "danger" },
};

const baseColumns: Column<SpecialtyRow>[] = [
  {
    key: "name",
    header: "Especialidad",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => <span className="text-muted-foreground">{row.description || EM_DASH}</span>,
  },
];

export function SpecialtiesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay especialidades. Crea la primera.",
}: {
  rows: SpecialtyRow[];
  isLoading: boolean;
  onEditAction: (specialty: SpecialtyRow) => void;
  onDeleteAction: (specialty: SpecialtyRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleSpecialtyActive();
  const restoreSpecialty = useRestoreSpecialty();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(specialty: SpecialtyRow) {
    toggleActive.mutate(specialty, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Especialidad "${specialty.name}" activada.`
            : `Especialidad "${specialty.name}" desactivada.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${specialty.name}".`,
        ),
    });
  }

  function handleRestore(specialty: SpecialtyRow) {
    restoreSpecialty.mutate(specialty.id, {
      onSuccess: () => toast.success(`Especialidad "${specialty.name}" restaurada.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo restaurar "${specialty.name}".`,
        ),
    });
  }

  // La columna "Activa" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Una especialidad eliminada no
  // se puede (des)activar: se ve solo el badge "Eliminada".
  const columns: Column<SpecialtyRow>[] = [
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
              aria-label={`Activar especialidad ${row.name}`}
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
                    disabled: restoreSpecialty.isPending && restoreSpecialty.variables === row.id,
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
