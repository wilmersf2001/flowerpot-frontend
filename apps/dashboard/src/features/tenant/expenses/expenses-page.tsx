"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { ExpenseRow, ExpenseStatus } from "./lib/expenses.types";
import { useExpenses } from "./lib/expenses.hooks";
import { ExpensesTable } from "./components/expenses-table";
import { ExpenseStatusFilter } from "./components/expense-status-filter";
import { ExpenseFormDialog } from "./components/expense-form-dialog";
import { ReviewExpenseDialog } from "./components/review-expense-dialog";
import { VoidExpenseDialog } from "./components/void-expense-dialog";
import { DeleteExpenseDialog } from "./components/delete-expense-dialog";

/** Pantalla de gastos: lista + búsqueda + filtro de estado + alta + revisión + anulación + borrado. */
export function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExpenseStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const expenses = useExpenses({
    page,
    search: debouncedSearch,
    status: status || undefined,
  });
  const meta = expenses.data;

  // Diálogo de alta/edición: "new" para crear, un gasto para editar, null cerrado.
  const [editing, setEditing] = useState<ExpenseRow | "new" | null>(null);
  const [reviewing, setReviewing] = useState<{ expense: ExpenseRow; action: "approve" | "reject" } | null>(
    null,
  );
  const [voiding, setVoiding] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState<ExpenseRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: ExpenseStatus | "") {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Gastos"
        description="Registro contable de gastos operativos del negocio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Registrar gasto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por descripción o comprobante…"
        />
        <ExpenseStatusFilter value={status} onChangeAction={handleStatusChange} />
      </div>

      {expenses.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de gastos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => expenses.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ExpensesTable
          rows={meta?.data ?? []}
          isLoading={expenses.isPending}
          onEditAction={setEditing}
          onReviewAction={(expense, action) => setReviewing({ expense, action })}
          onVoidAction={setVoiding}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch || status ? "Ningún gasto coincide con el filtro." : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: expenses.isFetching,
          }}
        />
      )}

      <ExpenseFormDialog
        open={editing !== null}
        expense={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <ReviewExpenseDialog
        expense={reviewing?.expense ?? null}
        action={reviewing?.action ?? "approve"}
        onOpenChangeAction={(open) => {
          if (!open) setReviewing(null);
        }}
      />
      <VoidExpenseDialog
        expense={voiding}
        onOpenChangeAction={(open) => {
          if (!open) setVoiding(null);
        }}
      />
      <DeleteExpenseDialog
        expense={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
