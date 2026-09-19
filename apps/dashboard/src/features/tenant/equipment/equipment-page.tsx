"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { AsyncCombobox, ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useEquipmentCategoryOptions } from "@/features/tenant/equipment-categories";
import type { EquipmentStatus } from "./lib/equipment.types";
import { useEquipmentList } from "./lib/equipment.hooks";
import { EquipmentTable } from "./components/equipment-table";
import { EquipmentFormDialog } from "./components/equipment-form-dialog";
import { EquipmentDetailDialog } from "./components/equipment-detail-dialog";
import { DecommissionEquipmentDialog } from "./components/decommission-equipment-dialog";
import { DeleteEquipmentDialog } from "./components/delete-equipment-dialog";
import type { EquipmentRow } from "./lib/equipment.types";

const ALL_CATEGORIES_OPTION: ComboboxOption = { value: "", label: "Todas las categorías" };
const ALL_BRANCHES_OPTION: ComboboxOption = { value: "", label: "Todas las sedes" };

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "operativo", label: "Operativo" },
  { value: "en_mantenimiento", label: "En mantenimiento" },
  { value: "fuera_de_servicio", label: "Fuera de servicio" },
  { value: "dado_de_baja", label: "Dado de baja" },
];

type StatusFilter = "" | EquipmentStatus;

/** Pantalla de equipos: catálogo del activo fijo del gimnasio (máquinas, pesas, bicicletas…). */
export function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const categoryOptions = useEquipmentCategoryOptions(true);
  const branchOptions = useBranchOptions(true);

  const equipment = useEquipmentList({
    page,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    branchId: branchId || undefined,
    status: status || undefined,
  });
  const meta = equipment.data;

  const [editing, setEditing] = useState<EquipmentRow | "new" | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [decommissioning, setDecommissioning] = useState<EquipmentRow | null>(null);
  const [deleting, setDeleting] = useState<EquipmentRow | null>(null);

  const hasFilters = Boolean(debouncedSearch || categoryId || branchId || status);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Equipos"
        description="Activo fijo del gimnasio: máquinas, pesas, bicicletas y su estado."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo equipo
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={withPageReset(setSearch)}
          placeholder="Buscar por nombre, marca, modelo o serie…"
        />
        <AsyncCombobox
          className="w-56"
          value={categoryId}
          onValueChange={withPageReset(setCategoryId)}
          source={categoryOptions}
          selectedOption={ALL_CATEGORIES_OPTION}
          placeholder="Categoría"
          searchPlaceholder="Buscar categoría…"
        />
        <AsyncCombobox
          className="w-48"
          value={branchId}
          onValueChange={withPageReset(setBranchId)}
          source={branchOptions}
          selectedOption={ALL_BRANCHES_OPTION}
          placeholder="Sede"
          searchPlaceholder="Buscar sede…"
        />
        <Combobox
          className="w-52"
          value={status}
          onValueChange={(next) => withPageReset(setStatus)(next as StatusFilter)}
          options={STATUS_OPTIONS}
          placeholder="Estado"
        />
      </div>

      {equipment.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de equipos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => equipment.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <EquipmentTable
          rows={meta?.data ?? []}
          isLoading={equipment.isPending}
          onViewAction={(row) => setViewingId(row.id)}
          onEditAction={setEditing}
          onDecommissionAction={setDecommissioning}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ningún equipo coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: equipment.isFetching,
          }}
        />
      )}

      <EquipmentFormDialog
        open={editing !== null}
        equipment={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <EquipmentDetailDialog
        equipmentId={viewingId}
        onOpenChangeAction={(open) => {
          if (!open) setViewingId(null);
        }}
      />
      <DecommissionEquipmentDialog
        equipment={decommissioning}
        onOpenChangeAction={(open) => {
          if (!open) setDecommissioning(null);
        }}
      />
      <DeleteEquipmentDialog
        equipment={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
