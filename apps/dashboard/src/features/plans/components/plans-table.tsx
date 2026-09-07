"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  RowActions,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { PlanRow } from "../lib/plans.types";

const columns: Column<PlanRow>[] = [
  {
    key: "name",
    header: "Plan",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "price_formatted",
    header: "Precio",
    cell: (row) => (
      <span className="text-muted-foreground">{row.price_formatted}</span>
    ),
  },
];

export function PlansTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay planes. Crea el primero.",
}: {
  rows: PlanRow[];
  isLoading: boolean;
  onEditAction: (plan: PlanRow) => void;
  onDeleteAction: (plan: PlanRow) => void;
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
