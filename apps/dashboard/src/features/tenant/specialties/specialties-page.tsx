"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { SpecialtyRow } from "./lib/specialties.types";
import { useSpecialties } from "./lib/specialties.hooks";
import { SpecialtiesTable } from "./components/specialties-table";
import { SpecialtyFormDialog } from "./components/specialty-form-dialog";
import { DeleteSpecialtyDialog } from "./components/delete-specialty-dialog";

/** Pantalla de especialidades: lista + búsqueda + paginación + alta + edición + borrado. */
export function SpecialtiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const specialties = useSpecialties({ page, search: debouncedSearch });
  const meta = specialties.data;

  // Diálogo de alta/edición: "new" para crear, una especialidad para editar, null cerrado.
  const [editing, setEditing] = useState<SpecialtyRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<SpecialtyRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Especialidades"
        description="Especialidades que pueden dictar los instructores."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva especialidad
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre…"
      />

      {specialties.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de especialidades.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => specialties.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <SpecialtiesTable
          rows={meta?.data ?? []}
          isLoading={specialties.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch ? "Ninguna especialidad coincide con la búsqueda." : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: specialties.isFetching,
          }}
        />
      )}

      <SpecialtyFormDialog
        open={editing !== null}
        specialty={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteSpecialtyDialog
        specialty={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
