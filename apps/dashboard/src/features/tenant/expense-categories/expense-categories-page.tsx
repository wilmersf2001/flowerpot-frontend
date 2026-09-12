"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { ExpenseCategoryRow } from "./lib/expense-categories.types";
import { useExpenseCategories } from "./lib/expense-categories.hooks";
import { ExpenseCategoriesTable } from "./components/expense-categories-table";
import { ExpenseCategoryFormDialog } from "./components/expense-category-form-dialog";
import { DeleteExpenseCategoryDialog } from "./components/delete-expense-category-dialog";

/** Pantalla de categorías de gasto: lista + búsqueda + paginación + alta + edición + borrado. */
export function ExpenseCategoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categories = useExpenseCategories({ page, search: debouncedSearch });
  const meta = categories.data;

  // Diálogo de alta/edición: "new" para crear, una categoría para editar, null cerrado.
  const [editing, setEditing] = useState<ExpenseCategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ExpenseCategoryRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Categorías de gasto"
        description="Clasifica los gastos operativos del negocio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por nombre…"
      />

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
        <ExpenseCategoriesTable
          rows={meta?.data ?? []}
          isLoading={categories.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch ? "Ninguna categoría coincide con la búsqueda." : undefined
          }
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

      <ExpenseCategoryFormDialog
        open={editing !== null}
        category={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteExpenseCategoryDialog
        category={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
