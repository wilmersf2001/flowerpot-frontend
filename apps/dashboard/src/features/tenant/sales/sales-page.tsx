"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { DatePicker } from "@repo/ui/date-picker";
import { ResourceHeader } from "@/features/_shared";
import { useCurrentCashRegister } from "@/features/tenant/cash-register";
import { SALE_PAYMENT_METHOD_LABELS, SALE_PAYMENT_METHODS } from "./lib/sales.constants";
import type { SalePaymentMethod, SaleRow, SaleStatus } from "./lib/sales.types";
import { useSales } from "./lib/sales.hooks";
import { SalesTable } from "./components/sales-table";
import { SaleFormDialog } from "./components/sale-form-dialog";
import { SaleDetailDialog } from "./components/sale-detail-dialog";
import { VoidSaleDialog } from "./components/void-sale-dialog";

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los métodos" },
  ...SALE_PAYMENT_METHODS.map((method) => ({ value: method, label: SALE_PAYMENT_METHOD_LABELS[method] })),
];

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  { value: "completed", label: "Completada" },
  { value: "voided", label: "Anulada" },
];

type PaymentMethodFilter = "" | SalePaymentMethod;
type StatusFilter = "" | SaleStatus;

/** Pantalla de ventas de tienda: filtros + tabla + registrar venta + anular. */
export function SalesPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const currentRegister = useCurrentCashRegister();

  const sales = useSales({
    page,
    paymentMethod: paymentMethod || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo ? `${dateTo} 23:59:59` : undefined,
  });
  const meta = sales.data;

  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<SaleRow | null>(null);
  const [voiding, setVoiding] = useState<SaleRow | null>(null);

  const hasFilters = Boolean(paymentMethod || status || dateFrom || dateTo);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Ventas"
        description="Ventas de la tienda en la sede activa. Descuentan stock al instante."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nueva venta
          </Button>
        }
      />

      {!currentRegister.isPending && currentRegister.data == null ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          No hay una caja abierta en esta sede: las ventas se registrarán, pero no se sumará ningún
          ingreso a caja.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Combobox
          className="w-48"
          value={paymentMethod}
          onValueChange={(next) => withPageReset(setPaymentMethod)(next as PaymentMethodFilter)}
          options={PAYMENT_METHOD_OPTIONS}
          placeholder="Método de pago"
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

      {sales.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar las ventas.{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => sales.refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <SalesTable
          rows={meta?.data ?? []}
          isLoading={sales.isPending}
          onViewAction={setViewing}
          onVoidAction={setVoiding}
          emptyMessage={hasFilters ? "Ninguna venta coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: sales.isFetching,
          }}
        />
      )}

      <SaleFormDialog open={creating} onOpenChangeAction={setCreating} />
      <SaleDetailDialog
        sale={viewing}
        onOpenChangeAction={(open) => {
          if (!open) setViewing(null);
        }}
      />
      <VoidSaleDialog
        sale={voiding}
        onOpenChangeAction={(open) => {
          if (!open) setVoiding(null);
        }}
      />
    </div>
  );
}
