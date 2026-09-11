"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { DataTable, RowActions, type Column } from "@/features/_shared";
import { RoleRow } from "../lib/roles.types";

const columns: Column<RoleRow>[] = [
  {
    key: "name",
    header: "Rol",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "is_custom",
    header: "Tipo",
    cell: (row) => (
      <Badge tone={row.is_custom ? "primary" : "neutral"} variant="soft" size="sm">
        {row.is_custom ? "Personalizado" : "Predeterminado"}
      </Badge>
    ),
  },
  {
    key: "users_count",
    header: "Usuarios",
    cell: (row) => <span className="text-muted-foreground">{row.users_count}</span>,
  },
  {
    key: "permissions",
    header: "Permisos",
    cell: (row) => (
      <span className="text-muted-foreground">{row.permissions.length}</span>
    ),
  },
];

export function RolesTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  emptyMessage = "Aún no hay roles personalizados.",
}: {
  rows: RoleRow[];
  isLoading: boolean;
  onEditAction: (role: RoleRow) => void;
  onDeleteAction: (role: RoleRow) => void;
  emptyMessage?: string;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      rowActions={(row) => (
        <RowActions
          label={`Acciones de ${row.name}`}
          actions={[
            {
              label: "Editar",
              icon: Pencil,
              // Los roles predeterminados (gym_owner, admin, receptionist) no se
              // pueden modificar.
              disabled: !row.is_custom,
              onSelect: () => onEditAction(row),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              disabled: !row.is_custom,
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
