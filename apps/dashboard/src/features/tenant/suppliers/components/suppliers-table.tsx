"use client";

import { Pencil, Trash2 } from "lucide-react";
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
} from "@/features/_shared";
import { SupplierRow } from "../lib/suppliers.types";
import { useToggleSupplierActive } from "../lib/suppliers.hooks";

const baseColumns: Column<SupplierRow>[] = [
  {
    key: "name",
    header: "Proveedor",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        {row.ruc ? <span className="text-xs text-muted-foreground">RUC {row.ruc}</span> : null}
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contacto",
    cell: (row) => (
      <div className="flex flex-col text-sm">
        {row.phone ? <span>{row.phone}</span> : null}
        {row.email ? <span className="text-muted-foreground">{row.email}</span> : null}
        {!row.phone && !row.email ? <span className="text-muted-foreground">—</span> : null}
      </div>
    ),
  },
];

export function SuppliersTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay proveedores. Crea el primero.",
}: {
  rows: SupplierRow[];
  isLoading: boolean;
  onEditAction: (supplier: SupplierRow) => void;
  onDeleteAction: (supplier: SupplierRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleSupplierActive();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(supplier: SupplierRow) {
    toggleActive.mutate(supplier, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Proveedor "${supplier.name}" activado.`
            : `Proveedor "${supplier.name}" desactivado.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${supplier.name}".`,
        ),
    });
  }

  const columns: Column<SupplierRow>[] = [
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
            aria-label={`Activar proveedor ${row.name}`}
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
            {
              label: "Editar",
              icon: Pencil,
              onSelect: () => onEditAction(row),
            },
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
