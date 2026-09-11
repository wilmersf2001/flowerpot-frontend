"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { MembershipRow } from "./lib/memberships.types";
import { useMemberships } from "./lib/memberships.hooks";
import { MembershipsTable } from "./components/memberships-table";
import { MembershipFormDialog } from "./components/membership-form-dialog";

/** Pantalla de membresías: lista + búsqueda + paginación + alta + edición. */
export function MembershipsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const memberships = useMemberships({ page, search: debouncedSearch });
  const meta = memberships.data;

  // Diálogo de alta/edición: "new" para crear, una fila para editar, null cerrado.
  const [editing, setEditing] = useState<MembershipRow | "new" | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Membresías"
        description="Planes asignados a cada socio: vigencia y estado."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva membresía
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por socio o plan…"
      />

      {memberships.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de membresías.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => memberships.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <MembershipsTable
          rows={meta?.data ?? []}
          isLoading={memberships.isPending}
          onEditAction={setEditing}
          emptyMessage={
            debouncedSearch
              ? "Ninguna membresía coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: memberships.isFetching,
          }}
        />
      )}

      <MembershipFormDialog
        open={editing !== null}
        membership={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
