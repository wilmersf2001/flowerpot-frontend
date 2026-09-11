import {
  ACTIVE_MAP,
  Column,
  DataTable,
  DataTablePagination,
  RowActions,
  StatusBadge,
} from "@/features/_shared";
import { GymSettingsRow } from "../lib/gym-settings.types";
import { Pencil } from "lucide-react";

const baseColumns: Column<GymSettingsRow>[] = [
  {
    key: "tenant_id",
    header: "Gimnasio",
    cell: (row) => <span className="text-medium">{row.tenant_id}</span>,
  },
  {
    key: "culqi_enabled",
    header: "Culqi habilitado",
    cell: (row) => <StatusBadge value={row.culqi_enabled} map={ACTIVE_MAP} />,
  },
  {
    key: "culqi_public_key",
    header: "Culqi public key",
    cell: (row) => (
      <span className="text-muted-foreground">{row.culqi_public_key}</span>
    ),
  },
  {
    key: "culqi_secret_key",
    header: "Culqi secret key",
    cell: (row) => (
      <span className="text-muted-foreground">{row.culqi_secret_key}</span>
    ),
  },
  {
    key: "timezone",
    header: "Zona horaria",
    cell: (row) => (
      <span className="text-muted-foreground">{row.timezone}</span>
    ),
  },
  {
    key: "currency",
    header: "Moneda",
    cell: (row) => (
      <span className="text-muted-foreground">{row.currency}</span>
    ),
  },
];

export function GymSettingsTable({
  rows,
  isLoading,
  onEditAction,
  pagination,
  emptyMessage = "No hay configuraciones de gimnasio para mostrar.",
}: {
  rows: GymSettingsRow[];
  isLoading: boolean;
  onEditAction: (row: GymSettingsRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  return (
    <DataTable
      columns={baseColumns}
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
