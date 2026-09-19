"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ActiveFilter, ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { ProductCategoryRow } from "./lib/product-categories.types";
import { useProductCategories } from "./lib/product-categories.hooks";
import { ProductCategoriesTable } from "./components/product-categories-table";
import { ProductCategoryFormDialog } from "./components/product-category-form-dialog";
import { DeleteProductCategoryDialog } from "./components/delete-product-category-dialog";

/** Pantalla de categorías de producto: lista + búsqueda + filtro + alta + edición + borrado. */
export function ProductCategoriesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categories = useProductCategories({
    page,
    search: debouncedSearch,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const meta = categories.data;

  // Diálogo de alta/edición: "new" para crear, una categoría para editar, null cerrado.
  const [editing, setEditing] = useState<ProductCategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ProductCategoryRow | null>(null);

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
        title="Categorías de producto"
        description="Agrupa los productos de la tienda del gimnasio."
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
        <ProductCategoriesTable
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

      <ProductCategoryFormDialog
        open={editing !== null}
        category={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteProductCategoryDialog
        category={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
