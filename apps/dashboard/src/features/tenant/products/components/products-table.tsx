"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import { ApiError } from "@repo/api-client";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  ACTIVE_MAP,
  formatMoney,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { ProductRow } from "../lib/products.types";
import { useRestoreProduct, useToggleProductActive } from "../lib/products.hooks";

const DELETED_MAP: StatusMap = {
  true: { label: "Eliminado", tone: "danger" },
};

/** Suma el stock de todas las sedes. Una sede sin registro equivale a 0. */
function totalStock(row: ProductRow): number {
  return row.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
}

const baseColumns: Column<ProductRow>[] = [
  {
    key: "name",
    header: "Producto",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.sku}</span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Categoría",
    cell: (row) => (
      <span className="text-muted-foreground">{row.category?.name ?? EM_DASH}</span>
    ),
  },
  {
    key: "sale_price",
    header: "Precio",
    cell: (row) => <span>{formatMoney(row.sale_price)}</span>,
  },
  {
    key: "cost",
    header: "Costo",
    cell: (row) => <span className="text-muted-foreground">{formatMoney(row.cost)}</span>,
  },
  {
    key: "stock",
    header: "Stock",
    cell: (row) =>
      row.stocks.length === 0 ? (
        <span className="text-muted-foreground">Sin stock</span>
      ) : (
        <div className="flex flex-col">
          <span className="font-medium">{totalStock(row)} uds</span>
          <span className="text-xs text-muted-foreground">
            {row.stocks.map((stock) => `${stock.branch_name}: ${stock.quantity}`).join(" · ")}
          </span>
        </div>
      ),
  },
];

export function ProductsTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay productos. Crea el primero.",
}: {
  rows: ProductRow[];
  isLoading: boolean;
  onEditAction: (product: ProductRow) => void;
  onDeleteAction: (product: ProductRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const toggleActive = useToggleProductActive();
  const restoreProduct = useRestoreProduct();
  const pendingId = toggleActive.isPending ? toggleActive.variables.id : undefined;

  function handleToggle(product: ProductRow) {
    toggleActive.mutate(product, {
      onSuccess: (updated) =>
        toast.success(
          updated.is_active
            ? `Producto "${product.name}" activado.`
            : `Producto "${product.name}" desactivado.`,
        ),
      onError: (err) =>
        toast.error(
          err instanceof ApiError
            ? err.message
            : `No se pudo cambiar el estado de "${product.name}".`,
        ),
    });
  }

  function handleRestore(product: ProductRow) {
    restoreProduct.mutate(product.id, {
      onSuccess: () => toast.success(`Producto "${product.name}" restaurado.`),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : `No se pudo restaurar "${product.name}".`,
        ),
    });
  }

  // La columna "Activo" combina el badge de estado con un switch para
  // cambiarlo sin abrir el diálogo de edición. Un producto eliminado no se
  // puede (des)activar: se ve solo el badge "Eliminado".
  const columns: Column<ProductRow>[] = [
    ...baseColumns,
    {
      key: "is_active",
      header: "Activo",
      cell: (row) =>
        row.deleted_at ? (
          <StatusBadge value={true} map={DELETED_MAP} />
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={row.is_active}
              disabled={pendingId === row.id}
              onCheckedChange={() => handleToggle(row)}
              aria-label={`Activar producto ${row.name}`}
            />
            <StatusBadge value={row.is_active} map={ACTIVE_MAP} />
          </div>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => {
        const isDeleted = Boolean(row.deleted_at);
        return (
          <RowActions
            label={`Acciones de ${row.name}`}
            actions={[
              isDeleted
                ? {
                    label: "Restaurar",
                    icon: RotateCcw,
                    disabled: restoreProduct.isPending && restoreProduct.variables === row.id,
                    onSelect: () => handleRestore(row),
                  }
                : {
                    label: "Editar",
                    icon: Pencil,
                    onSelect: () => onEditAction(row),
                  },
              !isDeleted && {
                label: "Eliminar",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => onDeleteAction(row),
              },
            ]}
          />
        );
      }}
    />
  );
}
