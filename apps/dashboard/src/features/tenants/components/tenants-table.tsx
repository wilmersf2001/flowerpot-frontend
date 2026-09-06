"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { DataTable, type Column } from "@/features/_shared";
import type { TenantRow } from "../lib/tenants.types";

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("es-PE", { dateStyle: "medium" });
}

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
  onDelete,
}: {
  rows: TenantRow[];
  isLoading: boolean;
  onDelete: (tenant: TenantRow) => void;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage="Aún no hay gimnasios. Crea el primero."
      rowActions={(row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones de {row.id}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)}>
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}
