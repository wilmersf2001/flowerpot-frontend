"use client";

import { Pencil } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  ACTIVE_MAP,
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDateTime,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { useToggleDeviceActive } from "../lib/devices.hooks";
import type { DeviceRow } from "../lib/devices.types";

const ONLINE_MAP: StatusMap = {
  true: { label: "En línea", tone: "success" },
  false: { label: "Sin conexión", tone: "neutral" },
};

const PENDING_MAP: StatusMap = {
  pending: { label: "Pendiente de sede", tone: "warning" },
};

const muted = (value: string | null | undefined) => (
  <span className="text-muted-foreground">{value || EM_DASH}</span>
);

export function DevicesTable({
  rows,
  isLoading,
  canEdit,
  onEditAction,
  pagination,
  emptyMessage = "Aún no tienes lectores asignados. Pídelos al administrador de la plataforma.",
}: {
  rows: DeviceRow[];
  isLoading: boolean;
  /** Permiso `devices.edit`: habilita el switch y la acción de configurar. */
  canEdit: boolean;
  onEditAction: (device: DeviceRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleDeviceActive();
  const pendingId = toggleActive.isPending ? toggleActive.variables?.id : undefined;

  function handleToggle(device: DeviceRow, next: boolean) {
    const label = device.name || device.serial_number;
    toggleActive.mutate(
      { id: device.id, isActive: next },
      {
        onSuccess: () =>
          toast.success(next ? `Lector "${label}" activado.` : `Lector "${label}" desactivado.`),
        onError: (err) =>
          toast.error(
            err instanceof ApiError ? err.message : `No se pudo cambiar el estado de "${label}".`,
          ),
      },
    );
  }

  const columns: Column<DeviceRow>[] = [
    {
      key: "name",
      header: "Lector",
      cell: (row) =>
        row.name ? (
          <span className="font-medium">{row.name}</span>
        ) : (
          <span className="text-muted-foreground">Sin nombre</span>
        ),
    },
    { key: "serial_number", header: "Serie", cell: (row) => muted(row.serial_number) },
    {
      key: "branch",
      header: "Sede",
      cell: (row) =>
        row.is_pending ? (
          <StatusBadge value="pending" map={PENDING_MAP} />
        ) : (
          muted(row.branch?.name)
        ),
    },
    { key: "model", header: "Modelo", cell: (row) => muted(row.model) },
    {
      key: "is_online",
      header: "Conexión",
      cell: (row) => <StatusBadge value={row.is_online} map={ONLINE_MAP} />,
    },
    {
      key: "last_seen_at",
      header: "Última conexión",
      cell: (row) => muted(row.last_seen_at ? formatDateTime(row.last_seen_at) : null),
    },
    {
      key: "is_active",
      header: "Activo",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={row.is_active}
            disabled={!canEdit || row.is_pending || pendingId === row.id}
            onCheckedChange={(next) => handleToggle(row, next)}
            aria-label={`Activar lector ${row.name || row.serial_number}`}
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
      rowActions={
        canEdit
          ? (row) => (
              <RowActions
                label={`Acciones de ${row.name || row.serial_number}`}
                actions={[
                  {
                    label: row.is_pending ? "Asignar sede" : "Configurar",
                    icon: Pencil,
                    onSelect: () => onEditAction(row),
                  },
                ]}
              />
            )
          : undefined
      }
    />
  );
}
