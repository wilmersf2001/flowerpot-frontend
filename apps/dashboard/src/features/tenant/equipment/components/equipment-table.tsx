"use client";

import { Ban, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDate,
  formatMoney,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { useRestoreEquipment } from "../lib/equipment.hooks";
import type { EquipmentRow } from "../lib/equipment.types";

const STATUS_MAP: StatusMap = {
  operativo: { label: "Operativo", tone: "success" },
  en_mantenimiento: { label: "En mantenimiento", tone: "warning" },
  fuera_de_servicio: { label: "Fuera de servicio", tone: "neutral" },
  dado_de_baja: { label: "Dado de baja", tone: "danger" },
};

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

/** `true` si la garantía ya venció (fecha de calendario, sin hora). */
function isWarrantyExpired(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${date}T00:00:00`) < today;
}

const baseColumns: Column<EquipmentRow>[] = [
  {
    key: "name",
    header: "Equipo",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">
          {[row.brand, row.model].filter(Boolean).join(" · ") || row.serial_number || EM_DASH}
        </span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Categoría",
    cell: (row) => <span className="text-muted-foreground">{row.category?.name ?? EM_DASH}</span>,
  },
  {
    key: "branch",
    header: "Sede",
    cell: (row) => <span className="text-muted-foreground">{row.branch?.name ?? EM_DASH}</span>,
  },
  {
    key: "purchase_cost",
    header: "Costo",
    cell: (row) => <span className="text-muted-foreground">{formatMoney(row.purchase_cost)}</span>,
  },
  {
    key: "warranty_expiration",
    header: "Garantía",
    cell: (row) =>
      row.warranty_expiration ? (
        <div className="flex flex-col">
          <span>{formatDate(row.warranty_expiration)}</span>
          {isWarrantyExpired(row.warranty_expiration) ? (
            <span className="text-xs text-destructive">Vencida</span>
          ) : null}
        </div>
      ) : (
        <span className="text-muted-foreground">{EM_DASH}</span>
      ),
  },
];

export function EquipmentTable({
  rows,
  isLoading,
  onViewAction,
  onEditAction,
  onDecommissionAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay equipos. Crea el primero.",
}: {
  rows: EquipmentRow[];
  isLoading: boolean;
  onViewAction: (equipment: EquipmentRow) => void;
  onEditAction: (equipment: EquipmentRow) => void;
  onDecommissionAction: (equipment: EquipmentRow) => void;
  onDeleteAction: (equipment: EquipmentRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const restoreEquipment = useRestoreEquipment();

  function handleRestore(equipment: EquipmentRow) {
    restoreEquipment.mutate(equipment.id, {
      onSuccess: () => toast.success(`Equipo "${equipment.name}" restaurado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : `No se pudo restaurar "${equipment.name}".`,
        ),
    });
  }

  const columns: Column<EquipmentRow>[] = [
    ...baseColumns,
    {
      key: "status",
      header: "Estado",
      cell: (row) =>
        row.deleted_at ? (
          <StatusBadge value={true} map={DELETED_MAP} />
        ) : (
          <StatusBadge value={row.status} map={STATUS_MAP} />
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
        const isDecommissioned = row.status === "dado_de_baja";
        return (
          <RowActions
            label={`Acciones de ${row.name}`}
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => onViewAction(row) },
              isDeleted && {
                label: "Restaurar",
                icon: RotateCcw,
                separatorBefore: true,
                disabled: restoreEquipment.isPending && restoreEquipment.variables === row.id,
                onSelect: () => handleRestore(row),
              },
              !isDeleted && {
                label: "Editar",
                icon: Pencil,
                separatorBefore: true,
                onSelect: () => onEditAction(row),
              },
              !isDeleted &&
                !isDecommissioned && {
                  label: "Dar de baja",
                  icon: Ban,
                  onSelect: () => onDecommissionAction(row),
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
