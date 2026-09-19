"use client";

import { useState } from "react";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { DatePicker } from "@repo/ui/date-picker";
import { AsyncCombobox, ResourceHeader } from "@/features/_shared";
import { useProductOptions } from "@/features/tenant/products";
import { useBranchOptions } from "@/features/tenant/branches";
import { STOCK_MOVEMENT_TYPES } from "./lib/stock-movements.constants";
import { useStockMovements } from "./lib/stock-movements.hooks";
import { StockMovementsTable } from "./components/stock-movements-table";

const ALL_PRODUCTS_OPTION: ComboboxOption = { value: "", label: "Todos los productos" };
const ALL_BRANCHES_OPTION: ComboboxOption = { value: "", label: "Todas las sedes" };

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los tipos" },
  { value: "compra", label: "Compra" },
  { value: "venta", label: "Venta" },
  { value: "anulacion_venta", label: "Anulación de venta" },
  { value: "ajuste", label: "Ajuste" },
];

type StockMovementTypeFilter = "" | (typeof STOCK_MOVEMENT_TYPES)[number];

/** Pestaña "Movimientos": historial de auditoría del stock (Kardex), solo lectura. */
export function StockMovementsPage() {
  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [type, setType] = useState<StockMovementTypeFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const productOptions = useProductOptions(true);
  const branchOptions = useBranchOptions(true);

  const movements = useStockMovements({
    page,
    productId: productId || undefined,
    branchId: branchId || undefined,
    type: type || undefined,
    dateFrom: dateFrom || undefined,
    // El backend filtra `created_at <=` con hora; sin hora se pierde el día completo.
    dateTo: dateTo ? `${dateTo} 23:59:59` : undefined,
  });
  const meta = movements.data;

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const hasFilters = Boolean(productId || branchId || type || dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Movimientos de stock"
        description="Historial de auditoría del inventario: compras, ventas y anulaciones. No se puede editar ni eliminar."
      />

      <div className="flex flex-wrap items-center gap-3">
        <AsyncCombobox
          className="w-56"
          value={productId}
          onValueChange={withPageReset(setProductId)}
          source={productOptions}
          selectedOption={ALL_PRODUCTS_OPTION}
          placeholder="Producto"
          searchPlaceholder="Buscar producto…"
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
          className="w-48"
          value={type}
          onValueChange={(next) => withPageReset(setType)(next as StockMovementTypeFilter)}
          options={TYPE_OPTIONS}
          placeholder="Tipo"
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

      {movements.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el historial de movimientos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => movements.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <StockMovementsTable
          rows={meta?.data ?? []}
          isLoading={movements.isPending}
          emptyMessage={hasFilters ? "Ningún movimiento coincide con el filtro." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: movements.isFetching,
          }}
        />
      )}
    </div>
  );
}
