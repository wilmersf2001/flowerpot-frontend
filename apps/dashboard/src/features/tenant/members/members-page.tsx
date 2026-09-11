"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { MemberRow } from "./lib/members.types";
import { useMembers } from "./lib/members.hooks";
import { MembersTable } from "./components/members-table";
import { MemberFormDialog } from "./components/member-form-dialog";
import { DeleteMemberDialog } from "./components/delete-member-dialog";

/** Pantalla de socios: lista + búsqueda + paginación + alta + edición + borrado. */
export function MembersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (nombre o DNI del socio).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const members = useMembers({ page, search: debouncedSearch });
  const meta = members.data;

  // Diálogo de alta/edición: "new" para crear, un socio para editar, null cerrado.
  const [editing, setEditing] = useState<MemberRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<MemberRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Socios"
        description="Padrón de socios del gimnasio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo socio
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre o DNI…"
      />

      {members.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de socios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => members.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <MembersTable
          rows={meta?.data ?? []}
          isLoading={members.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ningún socio coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: members.isFetching,
          }}
        />
      )}

      <MemberFormDialog
        open={editing !== null}
        member={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteMemberDialog
        member={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
