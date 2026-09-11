"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import { useTenants } from "./lib/tenants.hooks";
import type { CreateTenantResult, TenantRow } from "./lib/tenants.types";
import { TenantsTable } from "./components/tenants-table";
import { TenantFormDialog } from "./components/tenant-form-dialog";
import { TenantCredentialsDialog } from "./components/tenant-credentials-dialog";
import { DeleteTenantDialog } from "./components/delete-tenant-dialog";

/** Pantalla de gimnasios: lista + búsqueda + paginación + alta + baja. */
export function TenantsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (filtra por el id del tenant).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const tenants = useTenants({ page, search: debouncedSearch });
  const meta = tenants.data;

  const [formOpen, setFormOpen] = useState(false);
  const [credentials, setCredentials] = useState<CreateTenantResult | null>(
    null,
  );
  const [toDelete, setToDelete] = useState<TenantRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Gimnasios"
        description="Alta, baja y estado de cada gimnasio (tenant) del SaaS."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo gimnasio
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por identificador…"
      />

      {tenants.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de gimnasios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => tenants.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <TenantsTable
          rows={meta?.data ?? []}
          isLoading={tenants.isPending}
          onDeleteAction={setToDelete}
          emptyMessage={
            debouncedSearch
              ? "Ningún gimnasio coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: tenants.isFetching,
          }}
        />
      )}

      <TenantFormDialog
        open={formOpen}
        onOpenChangeAction={setFormOpen}
        onCreatedAction={setCredentials}
      />
      <TenantCredentialsDialog
        result={credentials}
        onCloseAction={() => setCredentials(null)}
      />
      <DeleteTenantDialog
        tenant={toDelete}
        onOpenChangeAction={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}
