"use client";

import { useState } from "react";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useGymSettings } from "./lib/gym-settings.hook";
import type { GymSettingsRow } from "./lib/gym-settings.types";
import { GymSettingsTable } from "./components/gym-settings-table";
import { GymSettingsFormDialog } from "./components/gym-settings-form-dialog";

/** Pantalla de configuración por gimnasio: lista + búsqueda + paginación + edición. */
export function GymSettingsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (filtra por el id del tenant).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const gymSettings = useGymSettings({ page, search: debouncedSearch });
  const meta = gymSettings.data;

  const [editing, setEditing] = useState<GymSettingsRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Configuración"
        description="Pagos con Culqi y ajustes regionales de cada gimnasio."
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por gimnasio…"
      />

      {gymSettings.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la configuración de los gimnasios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => gymSettings.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <GymSettingsTable
          rows={meta?.data ?? []}
          isLoading={gymSettings.isPending}
          onEditAction={setEditing}
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
            isFetching: gymSettings.isFetching,
          }}
        />
      )}

      <GymSettingsFormDialog
        gymSettings={editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
