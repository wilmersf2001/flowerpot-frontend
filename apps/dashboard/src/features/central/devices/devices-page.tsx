"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AsyncCombobox,
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import { useTenantOptions } from "@/features/central/tenants/lib/tenants.hooks";
import { useDevices } from "./lib/devices.hooks";
import type { DeviceOnlineFilter, DeviceRow } from "./lib/devices.types";
import { DevicesTable } from "./components/devices-table";
import { DeviceFormDialog } from "./components/device-form-dialog";
import { DeleteDeviceDialog } from "./components/delete-device-dialog";

const ONLINE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todas las conexiones" },
  { value: "1", label: "Conectados" },
  { value: "0", label: "Sin conexión" },
];

/** Pantalla de lectores biométricos: lista + filtros + alta + edición + retiro. */
export function DevicesPage() {
  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [online, setOnline] = useState<DeviceOnlineFilter>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const tenantOptions = useTenantOptions();
  const devices = useDevices({
    page,
    search: debouncedSearch,
    tenant_id: tenantId,
    online,
  });
  const meta = devices.data;
  const hasFilters = Boolean(debouncedSearch || tenantId || online);

  const [editing, setEditing] = useState<DeviceRow | "new" | null>(null);
  const [toDelete, setToDelete] = useState<DeviceRow | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Lectores"
        description="Lectores biométricos asignados a cada gimnasio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Asignar lector
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por serie…"
        />
        <div className="flex items-center gap-1">
          <AsyncCombobox
            value={tenantId}
            onValueChange={(value) => {
              setTenantId(value);
              setPage(1);
            }}
            source={tenantOptions}
            selectedOption={
              tenantId ? { value: tenantId, label: tenantId } : null
            }
            placeholder="Todos los gimnasios"
            searchPlaceholder="Buscar gimnasio…"
            emptyText="Sin gimnasios."
            className="w-52"
          />
          {tenantId ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar filtro de gimnasio"
              onClick={() => {
                setTenantId("");
                setPage(1);
              }}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <Combobox
          value={online}
          onValueChange={(value) => {
            setOnline(value as DeviceOnlineFilter);
            setPage(1);
          }}
          options={ONLINE_OPTIONS}
          className="w-48"
          placeholder="Conexión"
        />
      </div>

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
          onEditAction={setEditing}
          onDeleteAction={setToDelete}
          emptyMessage={
            hasFilters ? "Ningún lector coincide con el filtro." : undefined
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
        open={editing !== null}
        device={editing === "new" ? null : editing}
        defaultTenantId={tenantId}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteDeviceDialog
        device={toDelete}
        onOpenChangeAction={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}
