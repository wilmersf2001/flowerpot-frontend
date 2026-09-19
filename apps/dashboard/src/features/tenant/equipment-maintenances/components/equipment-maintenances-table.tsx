"use client";

import { Ban, CheckCircle2, Pencil, PlayCircle, RotateCcw, Trash2 } from "lucide-react";
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
import {
  useRestoreEquipmentMaintenance,
  useStartEquipmentMaintenance,
} from "../lib/equipment-maintenances.hooks";
import type { EquipmentMaintenanceRow } from "../lib/equipment-maintenances.types";

const TYPE_MAP: StatusMap = {
  preventivo: { label: "Preventivo", tone: "info" },
  correctivo: { label: "Correctivo", tone: "warning" },
};

const STATUS_MAP: StatusMap = {
  programado: { label: "Programado", tone: "warning" },
  en_progreso: { label: "En progreso", tone: "info" },
  completado: { label: "Completado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

const baseColumns: Column<EquipmentMaintenanceRow>[] = [
  {
    key: "type",
    header: "Tipo",
    cell: (row) => <StatusBadge value={row.type} map={TYPE_MAP} />,
  },
  {
    key: "equipment",
    header: "Equipo",
    cell: (row) => <span className="font-medium">{row.equipment?.name ?? EM_DASH}</span>,
  },
  {
    key: "supplier",
    header: "Proveedor",
    cell: (row) => <span className="text-muted-foreground">{row.supplier?.name ?? EM_DASH}</span>,
  },
  {
    key: "scheduled_date",
    header: "Fecha programada",
    cell: (row) => (
      <span className="text-muted-foreground">
        {row.scheduled_date ? formatDate(row.scheduled_date) : EM_DASH}
      </span>
    ),
  },
  {
    key: "cost",
    header: "Costo",
    cell: (row) => <span className="text-muted-foreground">{formatMoney(row.cost)}</span>,
  },
];

export function EquipmentMaintenancesTable({
  rows,
  isLoading,
  onEditAction,
  onCompleteAction,
  onCancelAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay mantenimientos. Crea el primero.",
}: {
  rows: EquipmentMaintenanceRow[];
  isLoading: boolean;
  onEditAction: (maintenance: EquipmentMaintenanceRow) => void;
  onCompleteAction: (maintenance: EquipmentMaintenanceRow) => void;
  onCancelAction: (maintenance: EquipmentMaintenanceRow) => void;
  onDeleteAction: (maintenance: EquipmentMaintenanceRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const startMaintenance = useStartEquipmentMaintenance();
  const restoreMaintenance = useRestoreEquipmentMaintenance();

  function handleStart(maintenance: EquipmentMaintenanceRow) {
    startMaintenance.mutate(maintenance.id, {
      onSuccess: () => toast.success("Mantenimiento iniciado. El equipo pasó a en mantenimiento."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo iniciar el mantenimiento."),
    });
  }

  function handleRestore(maintenance: EquipmentMaintenanceRow) {
    restoreMaintenance.mutate(maintenance.id, {
      onSuccess: () => toast.success("Mantenimiento restaurado."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo restaurar el mantenimiento."),
    });
  }

  const columns: Column<EquipmentMaintenanceRow>[] = [
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
        const isScheduled = row.status === "programado" && !isDeleted;
        const isInProgress = row.status === "en_progreso" && !isDeleted;
        const isDeletable = !isDeleted && row.status !== "en_progreso";
        return (
          <RowActions
            label={`Acciones del mantenimiento de ${row.equipment?.name ?? "equipo"}`}
            actions={[
              isDeleted && {
                label: "Restaurar",
                icon: RotateCcw,
                disabled: restoreMaintenance.isPending && restoreMaintenance.variables === row.id,
                onSelect: () => handleRestore(row),
              },
              isScheduled && {
                label: "Editar",
                icon: Pencil,
                onSelect: () => onEditAction(row),
              },
              isScheduled && {
                label: "Iniciar",
                icon: PlayCircle,
                disabled: startMaintenance.isPending && startMaintenance.variables === row.id,
                onSelect: () => handleStart(row),
              },
              isInProgress && {
                label: "Completar",
                icon: CheckCircle2,
                onSelect: () => onCompleteAction(row),
              },
              isScheduled && {
                label: "Cancelar",
                icon: Ban,
                onSelect: () => onCancelAction(row),
              },
              isDeletable && {
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
