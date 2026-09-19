"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ActiveFilter, ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { EquipmentCategoryRow } from "./lib/equipment-categories.types";
import { useEquipmentCategories } from "./lib/equipment-categories.hooks";
import { EquipmentCategoriesTable } from "./components/equipment-categories-table";
import { EquipmentCategoryFormDialog } from "./components/equipment-category-form-dialog";
import { DeleteEquipmentCategoryDialog } from "./components/delete-equipment-category-dialog";

/** Pantalla de categorías de equipo: lista + búsqueda + filtro + alta + edición + borrado. */
export function EquipmentCategoriesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categories = useEquipmentCategories({
    page,
    search: debouncedSearch,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const meta = categories.data;

  // Diálogo de alta/edición: "new" para crear, una categoría para editar, null cerrado.
  const [editing, setEditing] = useState<EquipmentCategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<EquipmentCategoryRow | null>(null);

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
        title="Categorías de equipo"
        description="Agrupa los equipos del gimnasio (cardio, pesas, máquinas…)."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por nombre…"
        />
        <ActiveFilter value={activeFilter} onChangeAction={handleActiveFilter} />
      </div>

      {categories.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de categorías.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => categories.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <EquipmentCategoriesTable
          rows={meta?.data ?? []}
          isLoading={categories.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ninguna categoría coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: categories.isFetching,
          }}
        />
      )}

      <EquipmentCategoryFormDialog
        open={editing !== null}
        category={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteEquipmentCategoryDialog
        category={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
