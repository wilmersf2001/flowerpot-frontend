"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { JobPositionRow } from "./lib/job-positions.types";
import { useJobPositions } from "./lib/job-positions.hooks";
import { JobPositionsTable } from "./components/job-positions-table";
import { JobPositionFormDialog } from "./components/job-position-form-dialog";
import { DeleteJobPositionDialog } from "./components/delete-job-position-dialog";

export function JobPositionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const jobPositions = useJobPositions({ page, search: debouncedSearch });
  const meta = jobPositions.data;

  // Diálogo de alta/edición: "new" para crear, un cargo para editar, null cerrado.
  const [editing, setEditing] = useState<JobPositionRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<JobPositionRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Cargos"
        description="Cargos o puestos del personal del gimnasio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo cargo
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre…"
      />

      {jobPositions.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de cargos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => jobPositions.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <JobPositionsTable
          rows={meta?.data ?? []}
          isLoading={jobPositions.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ningún cargo coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: jobPositions.isFetching,
          }}
        />
      )}

      <JobPositionFormDialog
        open={editing !== null}
        jobPosition={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteJobPositionDialog
        jobPosition={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
