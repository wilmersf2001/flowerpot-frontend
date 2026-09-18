"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { GymClassRow } from "./lib/gym-classes.types";
import { useGymClasses } from "./lib/gym-classes.hooks";
import { GymClassesTable } from "./components/gym-classes-table";
import { GymClassFormDialog } from "./components/gym-class-form-dialog";
import { DeleteGymClassDialog } from "./components/delete-gym-class-dialog";

/** Pantalla del catálogo de clases: lista + búsqueda + paginación + alta + edición + borrado. */
export function GymClassesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const gymClasses = useGymClasses({ page, search: debouncedSearch });
  const meta = gymClasses.data;

  // Diálogo de alta/edición: "new" para crear, una clase para editar, null cerrado.
  const [editing, setEditing] = useState<GymClassRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<GymClassRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Clases"
        description="Catálogo de clases del gimnasio, sin día ni hora todavía."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva clase
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre o descripción…"
      />

      {gymClasses.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el catálogo de clases.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => gymClasses.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <GymClassesTable
          rows={meta?.data ?? []}
          isLoading={gymClasses.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={debouncedSearch ? "Ninguna clase coincide con la búsqueda." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: gymClasses.isFetching,
          }}
        />
      )}

      <GymClassFormDialog
        open={editing !== null}
        gymClass={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteGymClassDialog
        gymClass={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
