"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ActiveFilter, ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { SupplierRow } from "./lib/suppliers.types";
import { useSuppliers } from "./lib/suppliers.hooks";
import { SuppliersTable } from "./components/suppliers-table";
import { SupplierFormDialog } from "./components/supplier-form-dialog";
import { DeleteSupplierDialog } from "./components/delete-supplier-dialog";

/** Pantalla de proveedores: lista + búsqueda + filtro + alta + edición + borrado. */
export function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const suppliers = useSuppliers({
    page,
    search: debouncedSearch,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const meta = suppliers.data;

  // Diálogo de alta/edición: "new" para crear, un proveedor para editar, null cerrado.
  const [editing, setEditing] = useState<SupplierRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<SupplierRow | null>(null);

  const hasFilters = Boolean(debouncedSearch || activeFilter);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleActiveFilter(value: "" | "true" | "false") {
    setActiveFilter(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Proveedores"
        description="Empresas o personas a las que se les compra mercadería o se les contrata un servicio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo proveedor
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por nombre o RUC…"
        />
        <ActiveFilter value={activeFilter} onChangeAction={handleActiveFilter} />
      </div>

      {suppliers.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de proveedores.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => suppliers.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <SuppliersTable
          rows={meta?.data ?? []}
          isLoading={suppliers.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ningún proveedor coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: suppliers.isFetching,
          }}
        />
      )}

      <SupplierFormDialog
        open={editing !== null}
        supplier={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteSupplierDialog
        supplier={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
