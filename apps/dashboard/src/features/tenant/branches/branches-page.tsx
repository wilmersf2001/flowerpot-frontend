"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { BranchRow } from "./lib/branches.types";
import { useBranches } from "./lib/branches.hooks";
import { BranchesTable } from "./components/branches-table";
import { BranchFormDialog } from "./components/branch-form-dialog";
import { DeleteBranchDialog } from "./components/delete-branch-dialog";

export function BranchesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (nombre de la sede).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const branches = useBranches({ page, search: debouncedSearch });
  const meta = branches.data;

  // Diálogo de alta/edición: "new" para crear, una sede para editar, null cerrado.
  const [editing, setEditing] = useState<BranchRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<BranchRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Sedes"
        description="Sedes del gimnasio y su configuración."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva sede
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre…"
      />

      {branches.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de sedes.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => branches.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <BranchesTable
          rows={meta?.data ?? []}
          isLoading={branches.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ninguna sede coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: branches.isFetching,
          }}
        />
      )}

      <BranchFormDialog
        open={editing !== null}
        branch={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteBranchDialog
        branch={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
