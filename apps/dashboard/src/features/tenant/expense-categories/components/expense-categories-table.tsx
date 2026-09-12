"use client";

import { Pencil, Trash2 } from "lucide-react";
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
} from "@/features/_shared";
import { ExpenseCategoryRow } from "../lib/expense-categories.types";
import { useToggleExpenseCategoryActive } from "../lib/expense-categories.hooks";

const baseColumns: Column<ExpenseCategoryRow>[] = [
  {
    key: "name",
    header: "Categoría",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => <span className="text-muted-foreground">{row.description || EM_DASH}</span>,
  },
];

export function ExpenseCategoriesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay categorías. Crea la primera.",
}: {
  rows: ExpenseCategoryRow[];
  isLoading: boolean;
  onEditAction: (category: ExpenseCategoryRow) => void;
  onDeleteAction: (category: ExpenseCategoryRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleExpenseCategoryActive();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(category: ExpenseCategoryRow) {
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

  const columns: Column<ExpenseCategoryRow>[] = [
    ...baseColumns,
    {
      key: "is_active",
      header: "Activo",
      cell: (row) => (
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
      rowActions={(row) => (
        <RowActions
          label={`Acciones de ${row.name}`}
          actions={[
            { label: "Editar", icon: Pencil, onSelect: () => onEditAction(row) },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
