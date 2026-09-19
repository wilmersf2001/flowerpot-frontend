"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ActiveFilter, AsyncCombobox, ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useProductCategoryOptions } from "@/features/tenant/product-categories";
import type { ProductRow } from "./lib/products.types";
import { useProducts } from "./lib/products.hooks";
import { ProductsTable } from "./components/products-table";
import { ProductFormDialog } from "./components/product-form-dialog";
import { DeleteProductDialog } from "./components/delete-product-dialog";

const ALL_CATEGORIES_OPTION = { value: "", label: "Todas las categorías" };

/** Pantalla de productos: filtros + tabla + alta + edición + borrado. */
export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categoryOptions = useProductCategoryOptions(true);

  const products = useProducts({
    page,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
  });
  const meta = products.data;

  // Diálogo de alta/edición: "new" para crear, un producto para editar, null cerrado.
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const hasFilters = Boolean(debouncedSearch || categoryId || activeFilter);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Productos"
        description="Catálogo de la tienda. El stock se actualiza al comprar y vender, no aquí."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por nombre o SKU…"
        />
        <AsyncCombobox
          className="w-52"
          value={categoryId}
          onValueChange={withPageReset(setCategoryId)}
          source={categoryOptions}
          selectedOption={ALL_CATEGORIES_OPTION}
          placeholder="Categoría"
          searchPlaceholder="Buscar categoría…"
        />
        <ActiveFilter value={activeFilter} onChangeAction={withPageReset(setActiveFilter)} />
      </div>

      {products.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el catálogo de productos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => products.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ProductsTable
          rows={meta?.data ?? []}
          isLoading={products.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ningún producto coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: products.isFetching,
          }}
        />
      )}

      <ProductFormDialog
        open={editing !== null}
        product={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteProductDialog
        product={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
