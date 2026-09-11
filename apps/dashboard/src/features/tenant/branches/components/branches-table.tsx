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
import { BranchRow } from "../lib/branches.types";
import { useRestoreBranch, useToggleBranchActive } from "../lib/branches.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminada", tone: "danger" },
};

const baseColumns: Column<BranchRow>[] = [
  {
    key: "name",
    header: "Sede",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "address",
    header: "Dirección",
    cell: (row) => (
      <span className="text-muted-foreground">{row.address || EM_DASH}</span>
    ),
  },
  {
    key: "phone",
    header: "Teléfono",
    cell: (row) => (
      <span className="text-muted-foreground">{row.phone || EM_DASH}</span>
    ),
  },
  {
    key: "timezone",
    header: "Zona horaria",
    cell: (row) => (
      <span className="text-muted-foreground">{row.timezone || EM_DASH}</span>
    ),
  },
];

export function BranchesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay sedes. Crea la primera.",
}: {
  rows: BranchRow[];
  isLoading: boolean;
  onEditAction: (branch: BranchRow) => void;
  onDeleteAction: (branch: BranchRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleBranchActive();
  const restoreBranch = useRestoreBranch();
  const pendingId = toggleActive.isPending ? toggleActive.variables : undefined;

  function handleToggle(branch: BranchRow) {
    toggleActive.mutate(branch.id, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Sede "${branch.name}" activada.`
            : `Sede "${branch.name}" desactivada.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${branch.name}".`,
        ),
    });
  }

  function handleRestore(branch: BranchRow) {
    restoreBranch.mutate(branch.id, {
      onSuccess: () => toast.success(`Sede "${branch.name}" restaurada.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo restaurar "${branch.name}".`,
        ),
    });
  }

  // La columna "Activa" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Una sede eliminada no se
  // puede (des)activar: se ve solo el badge "Eliminada".
  const columns: Column<BranchRow>[] = [
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
              aria-label={`Activar sede ${row.name}`}
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
                    disabled: restoreBranch.isPending && restoreBranch.variables === row.id,
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
