"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { ServiceRow } from "./lib/services.types";
import { useServices } from "./lib/services.hooks";
import { ServicesTable } from "./components/services-table";
import { ServiceFormDialog } from "./components/service-form-dialog";
import { DeleteServiceDialog } from "./components/delete-service-dialog";

/** Pantalla de servicios: lista + búsqueda + paginación + alta + edición + borrado. */
export function ServicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const services = useServices({ page, search: debouncedSearch });
  const meta = services.data;

  // Diálogo de alta/edición: "new" para crear, un servicio para editar, null cerrado.
  const [editing, setEditing] = useState<ServiceRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ServiceRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Servicios"
        description="Musculación, clases, nutrición y demás servicios que incluyen los planes."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo servicio
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre…"
      />

      {services.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de servicios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => services.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ServicesTable
          rows={meta?.data ?? []}
          isLoading={services.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch ? "Ningún servicio coincide con la búsqueda." : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: services.isFetching,
          }}
        />
      )}

      <ServiceFormDialog
        open={editing !== null}
        service={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteServiceDialog
        service={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
