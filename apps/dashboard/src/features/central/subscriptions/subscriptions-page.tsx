"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { SubscriptionRow } from "./lib/subscriptions.types";
import { useSubscriptions } from "./lib/subscriptions.hooks";
import { SubscriptionsTable } from "./components/subscriptions-table";
import { SubscriptionFormDialog } from "./components/subscription-form-dialog";

/** Pantalla de suscripciones: lista + búsqueda + paginación + alta + edición. */
export function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (gimnasio o plan de la suscripción).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const subscriptions = useSubscriptions({ page, search: debouncedSearch });
  const meta = subscriptions.data;

  // Diálogo de alta/edición: "new" para crear, una fila para editar, null cerrado.
  const [editing, setEditing] = useState<SubscriptionRow | "new" | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Suscripciones"
        description="Suscripciones de cada gimnasio: plan, vigencia y estado."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva suscripción
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por gimnasio o plan…"
      />

      {subscriptions.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de suscripciones.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => subscriptions.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <SubscriptionsTable
          rows={meta?.data ?? []}
          isLoading={subscriptions.isPending}
          onEditAction={setEditing}
          emptyMessage={
            debouncedSearch
              ? "Ninguna suscripción coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: subscriptions.isFetching,
          }}
        />
      )}

      <SubscriptionFormDialog
        open={editing !== null}
        subscription={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
