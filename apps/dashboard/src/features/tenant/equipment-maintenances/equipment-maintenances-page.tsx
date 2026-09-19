"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { DatePicker } from "@repo/ui/date-picker";
import { AsyncCombobox, ResourceHeader } from "@/features/_shared";
import { useEquipmentOptions } from "@/features/tenant/equipment";
import { useSupplierOptions } from "@/features/tenant/suppliers";
import type {
  EquipmentMaintenanceStatus,
  EquipmentMaintenanceType,
} from "./lib/equipment-maintenances.types";
import { useEquipmentMaintenances } from "./lib/equipment-maintenances.hooks";
import { EquipmentMaintenancesTable } from "./components/equipment-maintenances-table";
import { EquipmentMaintenanceFormDialog } from "./components/equipment-maintenance-form-dialog";
import { CompleteEquipmentMaintenanceDialog } from "./components/complete-equipment-maintenance-dialog";
import { CancelEquipmentMaintenanceDialog } from "./components/cancel-equipment-maintenance-dialog";
import { DeleteEquipmentMaintenanceDialog } from "./components/delete-equipment-maintenance-dialog";
import type { EquipmentMaintenanceRow } from "./lib/equipment-maintenances.types";

const ALL_EQUIPMENT_OPTION: ComboboxOption = { value: "", label: "Todos los equipos" };
const ALL_SUPPLIERS_OPTION: ComboboxOption = { value: "", label: "Todos los proveedores" };

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los tipos" },
  { value: "preventivo", label: "Preventivo" },
  { value: "correctivo", label: "Correctivo" },
];

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "programado", label: "Programado" },
  { value: "en_progreso", label: "En progreso" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

type TypeFilter = "" | EquipmentMaintenanceType;
type StatusFilter = "" | EquipmentMaintenanceStatus;

/** Pantalla de mantenimientos de equipo: filtros + tabla + alta + edición + flujo de estados. */
export function EquipmentMaintenancesPage() {
  const [equipmentId, setEquipmentId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [type, setType] = useState<TypeFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const equipmentOptions = useEquipmentOptions(true);
  const supplierOptions = useSupplierOptions(true);

  const maintenances = useEquipmentMaintenances({
    page,
    equipmentId: equipmentId || undefined,
    supplierId: supplierId || undefined,
    type: type || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const meta = maintenances.data;

  const [editing, setEditing] = useState<EquipmentMaintenanceRow | "new" | null>(null);
  const [completing, setCompleting] = useState<EquipmentMaintenanceRow | null>(null);
  const [cancelling, setCancelling] = useState<EquipmentMaintenanceRow | null>(null);
  const [deleting, setDeleting] = useState<EquipmentMaintenanceRow | null>(null);

  const hasFilters = Boolean(equipmentId || supplierId || type || status || dateFrom || dateTo);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Mantenimientos"
        description="Servicios preventivos y correctivos sobre los equipos del gimnasio."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo mantenimiento
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <AsyncCombobox
          className="w-56"
          value={equipmentId}
          onValueChange={withPageReset(setEquipmentId)}
          source={equipmentOptions}
          selectedOption={ALL_EQUIPMENT_OPTION}
          placeholder="Equipo"
          searchPlaceholder="Buscar equipo…"
        />
        <AsyncCombobox
          className="w-56"
          value={supplierId}
          onValueChange={withPageReset(setSupplierId)}
          source={supplierOptions}
          selectedOption={ALL_SUPPLIERS_OPTION}
          placeholder="Proveedor"
          searchPlaceholder="Buscar proveedor…"
        />
        <Combobox
          className="w-40"
          value={type}
          onValueChange={(next) => withPageReset(setType)(next as TypeFilter)}
          options={TYPE_OPTIONS}
          placeholder="Tipo"
        />
        <Combobox
          className="w-44"
          value={status}
          onValueChange={(next) => withPageReset(setStatus)(next as StatusFilter)}
          options={STATUS_OPTIONS}
          placeholder="Estado"
        />
        <DatePicker
          className="w-44"
          value={dateFrom}
          onValueChange={withPageReset(setDateFrom)}
          placeholder="Desde"
          toDate={dateTo ? new Date(`${dateTo}T00:00:00`) : undefined}
        />
        <DatePicker
          className="w-44"
          value={dateTo}
          onValueChange={withPageReset(setDateTo)}
          placeholder="Hasta"
          fromDate={dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined}
        />
      </div>

      {maintenances.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar los mantenimientos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => maintenances.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <EquipmentMaintenancesTable
          rows={meta?.data ?? []}
          isLoading={maintenances.isPending}
          onEditAction={setEditing}
          onCompleteAction={setCompleting}
          onCancelAction={setCancelling}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ningún mantenimiento coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: maintenances.isFetching,
          }}
        />
      )}

      <EquipmentMaintenanceFormDialog
        open={editing !== null}
        maintenance={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <CompleteEquipmentMaintenanceDialog
        maintenance={completing}
        onOpenChangeAction={(open) => {
          if (!open) setCompleting(null);
        }}
      />
      <CancelEquipmentMaintenanceDialog
        maintenance={cancelling}
        onOpenChangeAction={(open) => {
          if (!open) setCancelling(null);
        }}
      />
      <DeleteEquipmentMaintenanceDialog
        maintenance={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
