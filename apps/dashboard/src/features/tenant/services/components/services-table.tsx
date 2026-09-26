"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  ACTIVE_MAP,
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { SERVICE_TYPE_LABELS } from "../lib/services.constants";
import { useToggleServiceActive } from "../lib/services.hooks";
import type { ServiceRow } from "../lib/services.types";

const baseColumns: Column<ServiceRow>[] = [
  {
    key: "sort_order",
    header: "Orden",
    cell: (row) => <span className="text-medium">{row.sort_order}</span>,
  },
  {
    key: "name",
    header: "Servicio",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "type",
    header: "Tipo",
    cell: (row) => (
      <span className="text-muted-foreground">
        {SERVICE_TYPE_LABELS[row.type] ?? row.type}
      </span>
    ),
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => (
      <span className="text-muted-foreground">{row.description || EM_DASH}</span>
    ),
  },
];

export function ServicesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay servicios. Crea el primero.",
}: {
  rows: ServiceRow[];
  isLoading: boolean;
  onEditAction: (service: ServiceRow) => void;
  onDeleteAction: (service: ServiceRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleServiceActive();
  const pendingId = toggleActive.isPending ? toggleActive.variables?.id : undefined;

  function handleToggle(service: ServiceRow, next: boolean) {
    toggleActive.mutate(
      { id: service.id, isActive: next },
      {
        onSuccess: () =>
          toast.success(
            next
              ? `Servicio "${service.name}" activado.`
              : `Servicio "${service.name}" desactivado.`,
          ),
        onError: (err) =>
          toast.error(
            err instanceof ApiError
              ? err.message
              : `No se pudo cambiar el estado de "${service.name}".`,
          ),
      },
    );
  }

  const columns: Column<ServiceRow>[] = [
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
            onCheckedChange={(next) => handleToggle(row, next)}
            aria-label={`Activar servicio ${row.name}`}
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
