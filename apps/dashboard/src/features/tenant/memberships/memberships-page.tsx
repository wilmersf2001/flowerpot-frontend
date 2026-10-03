"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { MembershipRow } from "./lib/memberships.types";
import { useMemberships } from "./lib/memberships.hooks";
import { MembershipsTable } from "./components/memberships-table";
import { MembershipBranchesDialog } from "./components/membership-branches-dialog";
import { MembershipFormDialog } from "./components/membership-form-dialog";

/**
 * Filtro de estado. Por defecto solo las vigentes: las canceladas y expiradas
 * no se borran (son el historial del socio y tienen pagos), solo se ocultan.
 */
const ACTIVE_STATUSES = "active,pending";
const STATUS_OPTIONS: ComboboxOption[] = [
  { value: ACTIVE_STATUSES, label: "Vigentes" },
  { value: "active", label: "Activas" },
  { value: "pending", label: "Pendientes de pago" },
  { value: "cancelled", label: "Canceladas" },
  { value: "expired", label: "Expiradas" },
  { value: "", label: "Todas" },
];

/** Pantalla de membresías: lista + búsqueda + filtro + paginación + alta + edición. */
export function MembershipsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ACTIVE_STATUSES);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const memberships = useMemberships({
    page,
    search: debouncedSearch,
    status: status || undefined,
  });
  const meta = memberships.data;

  // Diálogo de alta/edición: "new" para crear, una fila para editar, null cerrado.
  const [editing, setEditing] = useState<MembershipRow | "new" | null>(null);
  const [changingBranches, setChangingBranches] = useState<MembershipRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Membresías"
        description="Planes asignados a cada socio: vigencia y estado."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva membresía
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por socio o plan…"
        />
        <Combobox
          className="w-52"
          value={status}
          onValueChange={handleStatus}
          options={STATUS_OPTIONS}
          placeholder="Estado"
        />
      </div>

      {memberships.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de membresías.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => memberships.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <MembershipsTable
          rows={meta?.data ?? []}
          isLoading={memberships.isPending}
          onEditAction={setEditing}
          onChangeBranchesAction={setChangingBranches}
          emptyMessage={
            debouncedSearch || status !== ACTIVE_STATUSES
              ? "Ninguna membresía coincide con la búsqueda o el filtro."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: memberships.isFetching,
          }}
        />
      )}

      <MembershipFormDialog
        open={editing !== null}
        membership={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <MembershipBranchesDialog
        membership={changingBranches}
        onOpenChangeAction={(open) => {
          if (!open) setChangingBranches(null);
        }}
      />
    </div>
  );
}
