"use client";

import { useState } from "react";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { DEVICES_EDIT_PERMISSION } from "./lib/devices.constants";
import { useDevices } from "./lib/devices.hooks";
import type { DeviceRow } from "./lib/devices.types";
import { DevicesTable } from "./components/devices-table";
import { DeviceFormDialog } from "./components/device-form-dialog";

/** Lectores biométricos del gimnasio: los asigna el SaaS, aquí se configuran. */
export function DevicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const devices = useDevices({ page, search: debouncedSearch });
  const meta = devices.data;
  const hasPermission = useHasPermission();
  const canEdit = hasPermission(DEVICES_EDIT_PERMISSION);

  const [editing, setEditing] = useState<DeviceRow | null>(null);
  const pendingCount = meta?.data.filter((d) => d.is_pending).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Lectores"
        description="Lectores biométricos de tu gimnasio. Los asigna la plataforma; aquí eliges su sede y nombre."
      />

      {pendingCount > 0 ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          {pendingCount === 1
            ? "Tienes 1 lector pendiente de sede."
            : `Tienes ${pendingCount} lectores pendientes de sede.`}{" "}
          Asígnale una sede para empezar a usarlo.
        </div>
      ) : null}

      <SearchInput
        value={search}
        onChangeAction={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Buscar por nombre o serie…"
      />

      {devices.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de lectores.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => devices.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <DevicesTable
          rows={meta?.data ?? []}
          isLoading={devices.isPending}
          canEdit={canEdit}
          onEditAction={setEditing}
          emptyMessage={
            debouncedSearch
              ? "Ningún lector coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: devices.isFetching,
          }}
        />
      )}

      <DeviceFormDialog
        device={editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
