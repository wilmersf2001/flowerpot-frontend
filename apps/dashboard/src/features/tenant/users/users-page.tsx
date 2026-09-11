"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useUsers } from "./lib/users.hooks";
import { useRoles } from "./lib/roles.hooks";
import type { UserRow } from "./lib/users.types";
import type { RoleRow } from "./lib/roles.types";
import { UsersTable } from "./components/users-table";
import { UserFormDialog } from "./components/user-form-dialog";
import { AssignRoleDialog } from "./components/assign-role-dialog";
import { DeleteUserDialog } from "./components/delete-user-dialog";
import { RolesTable } from "./components/roles-table";
import { RoleFormDialog } from "./components/role-form-dialog";
import { DeleteRoleDialog } from "./components/delete-role-dialog";

/** Pantalla de control de acceso: cuentas del sistema y roles/permisos, en pestañas. */
export function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Usuarios"
        description="Cuentas de acceso al panel y los roles que definen sus permisos."
      />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y permisos</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (nombre o email del usuario).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const users = useUsers({ page, search: debouncedSearch });
  const meta = users.data;

  // Diálogo de alta/edición: "new" para crear, un usuario para editar, null cerrado.
  const [editing, setEditing] = useState<UserRow | "new" | null>(null);
  const [assigning, setAssigning] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por nombre o email…"
        />
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      {users.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de usuarios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => users.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <UsersTable
          rows={meta?.data ?? []}
          isLoading={users.isPending}
          onEditAction={setEditing}
          onAssignRoleAction={setAssigning}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ningún usuario coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: users.isFetching,
          }}
        />
      )}

      <UserFormDialog
        open={editing !== null}
        user={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <AssignRoleDialog
        user={assigning}
        onOpenChangeAction={(open) => {
          if (!open) setAssigning(null);
        }}
      />
      <DeleteUserDialog
        user={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}

function RolesTab() {
  const roles = useRoles();
  const meta = roles.data;

  const [editing, setEditing] = useState<RoleRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<RoleRow | null>(null);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Nuevo rol
        </Button>
      </div>

      {roles.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de roles.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => roles.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <RolesTable
          rows={meta?.data ?? []}
          isLoading={roles.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
        />
      )}

      <RoleFormDialog
        open={editing !== null}
        role={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteRoleDialog
        role={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
