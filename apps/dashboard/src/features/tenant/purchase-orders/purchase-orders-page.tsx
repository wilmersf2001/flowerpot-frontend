"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { DatePicker } from "@repo/ui/date-picker";
import { AsyncCombobox, ResourceHeader } from "@/features/_shared";
import { useSupplierOptions } from "@/features/tenant/suppliers";
import { useBranchOptions } from "@/features/tenant/branches";
import type { PurchaseOrderStatus } from "./lib/purchase-orders.types";
import { usePurchaseOrders } from "./lib/purchase-orders.hooks";
import { PurchaseOrdersTable } from "./components/purchase-orders-table";
import { PurchaseOrderFormDialog } from "./components/purchase-order-form-dialog";
import { PurchaseOrderDetailDialog } from "./components/purchase-order-detail-dialog";
import { ReceivePurchaseOrderDialog } from "./components/receive-purchase-order-dialog";
import { DeletePurchaseOrderDialog } from "./components/delete-purchase-order-dialog";
import type { PurchaseOrderRow } from "./lib/purchase-orders.types";

const ALL_SUPPLIERS_OPTION: ComboboxOption = { value: "", label: "Todos los proveedores" };
const ALL_BRANCHES_OPTION: ComboboxOption = { value: "", label: "Todas las sedes" };

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "received", label: "Recibida" },
];

type StatusFilter = "" | PurchaseOrderStatus;

/** Pestaña "Órdenes de compra": filtros + tabla + alta + edición + recepción + borrado. */
export function PurchaseOrdersPage() {
  const [supplierId, setSupplierId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const supplierOptions = useSupplierOptions(true);
  const branchOptions = useBranchOptions(true);

  const orders = usePurchaseOrders({
    page,
    supplierId: supplierId || undefined,
    branchId: branchId || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const meta = orders.data;

  const [editing, setEditing] = useState<PurchaseOrderRow | "new" | null>(null);
  const [viewing, setViewing] = useState<PurchaseOrderRow | null>(null);
  const [receiving, setReceiving] = useState<PurchaseOrderRow | null>(null);
  const [deleting, setDeleting] = useState<PurchaseOrderRow | null>(null);

  const hasFilters = Boolean(supplierId || branchId || status || dateFrom || dateTo);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Órdenes de compra"
        description="Pedidos de mercadería a proveedores. El stock solo sube al recibir la orden."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva orden
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <AsyncCombobox
          className="w-56"
          value={supplierId}
          onValueChange={withPageReset(setSupplierId)}
          source={supplierOptions}
          selectedOption={ALL_SUPPLIERS_OPTION}
          placeholder="Proveedor"
          searchPlaceholder="Buscar proveedor…"
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

      {orders.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar las órdenes de compra.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => orders.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <PurchaseOrdersTable
          rows={meta?.data ?? []}
          isLoading={orders.isPending}
          onViewAction={setViewing}
          onEditAction={setEditing}
          onReceiveAction={setReceiving}
          onDeleteAction={setDeleting}
          emptyMessage={hasFilters ? "Ninguna orden coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: orders.isFetching,
          }}
        />
      )}

      <PurchaseOrderFormDialog
        open={editing !== null}
        order={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <PurchaseOrderDetailDialog
        order={viewing}
        onOpenChangeAction={(open) => {
          if (!open) setViewing(null);
        }}
      />
      <ReceivePurchaseOrderDialog
        order={receiving}
        onOpenChangeAction={(open) => {
          if (!open) setReceiving(null);
        }}
      />
      <DeletePurchaseOrderDialog
        order={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
