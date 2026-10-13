"use client";

import { Fingerprint, Trash2 } from "lucide-react";
import {
  DataTable,
  RowActions,
  formatDate,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import type { TenantRow } from "../lib/tenants.types";

const columns: Column<TenantRow>[] = [
  {
    key: "id",
    header: "Identificador",
    cell: (row) => <span className="font-medium">{row.id}</span>,
  },
  {
    key: "created_at",
    header: "Creado",
    cell: (row) => (
      <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
    ),
  },
];

export function TenantsTable({
  rows,
  isLoading,
  onDeleteAction,
  onDevicesAction,
  pagination,
  emptyMessage = "Aún no hay gimnasios. Crea el primero.",
}: {
  rows: TenantRow[];
  isLoading: boolean;
  onDeleteAction: (tenant: TenantRow) => void;
  onDevicesAction: (tenant: TenantRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => (
        <RowActions
          label={`Acciones de ${row.id}`}
          actions={[
            {
              label: "Ver lectores",
              icon: Fingerprint,
              onSelect: () => onDevicesAction(row),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
