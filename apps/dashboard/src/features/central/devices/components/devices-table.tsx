"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDateTime,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import type { DeviceRow } from "../lib/devices.types";

const ONLINE_MAP: StatusMap = {
  true: { label: "En línea", tone: "success" },
  false: { label: "Sin conexión", tone: "neutral" },
};

const muted = (value: string | null | undefined) => (
  <span className="text-muted-foreground">{value || EM_DASH}</span>
);

export function DevicesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  hideTenant = false,
  pagination,
  emptyMessage = "Aún no hay lectores asignados.",
}: {
  rows: DeviceRow[];
  isLoading: boolean;
  onEditAction: (device: DeviceRow) => void;
  onDeleteAction: (device: DeviceRow) => void;
  /** Oculta la columna de gimnasio (cuando la lista ya es de un solo gimnasio). */
  hideTenant?: boolean;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const columns: Column<DeviceRow>[] = [
    {
      key: "serial_number",
      header: "Serie",
      cell: (row) => <span className="font-medium">{row.serial_number}</span>,
    },
    ...(hideTenant
      ? []
      : [
          {
            key: "tenant_id",
            header: "Gimnasio",
            cell: (row: DeviceRow) => row.tenant_id,
          },
        ]),
    { key: "model", header: "Modelo", cell: (row) => muted(row.model) },
    {
      key: "is_online",
      header: "Estado",
      cell: (row) => <StatusBadge value={row.is_online} map={ONLINE_MAP} />,
    },
    {
      key: "last_seen_at",
      header: "Última conexión",
      cell: (row) =>
        muted(row.last_seen_at ? formatDateTime(row.last_seen_at) : null),
    },
    { key: "firmware", header: "Firmware", cell: (row) => muted(row.firmware) },
    { key: "reported_ip", header: "IP", cell: (row) => muted(row.reported_ip) },
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
          label={`Acciones de ${row.serial_number}`}
          actions={[
            { label: "Editar", icon: Pencil, onSelect: () => onEditAction(row) },
            {
              label: "Retirar",
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
