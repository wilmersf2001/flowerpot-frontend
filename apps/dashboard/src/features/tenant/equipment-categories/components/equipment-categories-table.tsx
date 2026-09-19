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
import { EquipmentCategoryRow } from "../lib/equipment-categories.types";
import {
  useRestoreEquipmentCategory,
  useToggleEquipmentCategoryActive,
} from "../lib/equipment-categories.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminada", tone: "danger" },
};

const baseColumns: Column<EquipmentCategoryRow>[] = [
  {
    key: "name",
    header: "Categoría",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
];

export function EquipmentCategoriesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay categorías. Crea la primera.",
}: {
  rows: EquipmentCategoryRow[];
  isLoading: boolean;
  onEditAction: (category: EquipmentCategoryRow) => void;
  onDeleteAction: (category: EquipmentCategoryRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleEquipmentCategoryActive();
  const restoreCategory = useRestoreEquipmentCategory();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(category: EquipmentCategoryRow) {
    toggleActive.mutate(category, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Categoría "${category.name}" activada.`
            : `Categoría "${category.name}" desactivada.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${category.name}".`,
        ),
    });
  }

  function handleRestore(category: EquipmentCategoryRow) {
    restoreCategory.mutate(category.id, {
      onSuccess: () => toast.success(`Categoría "${category.name}" restaurada.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : `No se pudo restaurar "${category.name}".`,
        ),
    });
  }

  // La columna "Activa" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Una categoría eliminada no se
  // puede (des)activar: se ve solo el badge "Eliminada".
  const columns: Column<EquipmentCategoryRow>[] = [
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
              aria-label={`Activar categoría ${row.name}`}
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
                    disabled: restoreCategory.isPending && restoreCategory.variables === row.id,
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
