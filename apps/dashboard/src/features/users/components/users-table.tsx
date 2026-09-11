"use client";

import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import {
  DataTable,
  EM_DASH,
  RowActions,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { UserRow } from "../lib/users.types";

const columns: Column<UserRow>[] = [
  {
    key: "name",
    header: "Nombre",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
  },
  {
    key: "role",
    header: "Rol",
    cell: (row) => (
      <Badge tone="neutral" variant="soft" size="sm">
        {row.role}
      </Badge>
    ),
  },
  {
    key: "is_owner",
    header: "Dueño",
    cell: (row) =>
      row.is_owner ? (
        <Badge tone="info" size="sm">
          Dueño
        </Badge>
      ) : (
        <span className="text-muted-foreground">{EM_DASH}</span>
      ),
  },
];

export function UsersTable({
  rows,
  isLoading,
  onEditAction,
  onAssignRoleAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay usuarios. Crea el primero.",
}: {
  rows: UserRow[];
  isLoading: boolean;
  onEditAction: (user: UserRow) => void;
  onAssignRoleAction: (user: UserRow) => void;
  onDeleteAction: (user: UserRow) => void;
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
          label={`Acciones de ${row.name}`}
          actions={[
            {
              label: "Editar",
              icon: Pencil,
              onSelect: () => onEditAction(row),
            },
            {
              label: "Cambiar rol",
              icon: KeyRound,
              onSelect: () => onAssignRoleAction(row),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              // El dueño del gimnasio no se puede eliminar desde la UI.
              disabled: row.is_owner,
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
