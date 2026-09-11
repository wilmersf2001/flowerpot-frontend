"use client";

import { Pencil } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import {
  DataTable,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { PlanRow } from "../lib/plans.types";
import { useTogglePlanActive } from "../lib/plans.hooks";

const baseColumns: Column<PlanRow>[] = [
  {
    key: "sort_order",
    header: "Orden",
    cell: (row) => <span className="text-medium">{row.sort_order}</span>,
  },
  {
    key: "name",
    header: "Plan",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "description",
    header: "Descripción",
    cell: (row) => (
      <span className="text-muted-foreground">{row.description}</span>
    ),
  },
  {
    key: "price_formatted",
    header: "Precio",
    cell: (row) => (
      <span className="text-muted-foreground">{row.price_formatted}</span>
    ),
  },
  {
    key: "max_locations",
    header: "Ubicaciones",
    cell: (row) => (
      <span className="text-muted-foreground">{row.max_locations}</span>
    ),
  },
  {
    key: "max_members",
    header: "Miembros",
    cell: (row) => (
      <span className="text-muted-foreground">{row.max_members}</span>
    ),
  },
];

export function PlansTable({
  rows,
  isLoading,
  onEditAction,
  pagination,
  emptyMessage = "Aún no hay planes. Crea el primero.",
}: {
  rows: PlanRow[];
  isLoading: boolean;
  onEditAction: (plan: PlanRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useTogglePlanActive();
  const pendingId = toggleActive.isPending
    ? toggleActive.variables?.id
    : undefined;

  function handleToggle(plan: PlanRow, next: boolean) {
    toggleActive.mutate(
      { id: plan.id, isActive: next },
      {
        onSuccess: () =>
          toast.success(
            next
              ? `Plan "${plan.name}" activado.`
              : `Plan "${plan.name}" desactivado.`,
          ),
        onError: () =>
          toast.error(`No se pudo cambiar el estado de "${plan.name}".`),
      },
    );
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición.
  const columns: Column<PlanRow>[] = [
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
            aria-label={`Activar plan ${row.name}`}
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
          label={`Acciones de ${row.id}`}
          actions={[
            {
              label: "Editar",
              icon: Pencil,
              onSelect: () => onEditAction(row),
            },
          ]}
        />
      )}
    />
  );
}
