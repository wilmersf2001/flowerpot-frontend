"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import {
  ACTIVE_MAP,
  DataTable,
  RowActions,
  StatusBadge,
  formatDate,
  formatMoney,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import type { PromotionRow } from "../lib/promotions.types";
import { useUpdatePromotion } from "../lib/promotions.hooks";

function discountLabel(p: PromotionRow): string {
  if (p.discount_formatted) return p.discount_formatted;
  return p.discount_type === "percentage"
    ? `${p.discount_value}%`
    : formatMoney(p.discount_value / 100);
}

export function PromotionsTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay promociones. Crea la primera.",
}: {
  rows: PromotionRow[];
  isLoading: boolean;
  onEditAction: (promotion: PromotionRow) => void;
  onDeleteAction: (promotion: PromotionRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const update = useUpdatePromotion();
  const pendingId = update.isPending ? update.variables?.id : undefined;

  function handleToggle(p: PromotionRow, next: boolean) {
    update.mutate(
      { id: p.id, input: { is_active: next } },
      {
        onSuccess: () =>
          toast.success(
            `Promoción "${p.code}" ${next ? "activada" : "desactivada"}.`,
          ),
        onError: () => toast.error(`No se pudo cambiar "${p.code}".`),
      },
    );
  }

  const columns: Column<PromotionRow>[] = [
    {
      key: "code",
      header: "Código",
      cell: (r) => <span className="font-mono font-medium">{r.code}</span>,
    },
    { key: "name", header: "Nombre", cell: (r) => r.name },
    {
      key: "discount",
      header: "Descuento",
      cell: (r) => <span className="text-muted-foreground">{discountLabel(r)}</span>,
    },
    {
      key: "validity",
      header: "Vigencia",
      cell: (r) => (
        <span className="text-muted-foreground">
          {formatDate(r.valid_from)} → {r.valid_until ? formatDate(r.valid_until) : "sin fin"}
        </span>
      ),
    },
    {
      key: "uses",
      header: "Usos",
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.current_uses}
          {r.max_uses != null ? ` / ${r.max_uses}` : ""}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Activa",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={r.is_active}
            disabled={pendingId === r.id}
            onCheckedChange={(next) => handleToggle(r, next)}
            aria-label={`Activar promoción ${r.code}`}
          />
          <StatusBadge value={r.is_active} map={ACTIVE_MAP} />
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
      rowActions={(row) => (
        <RowActions
          label={`Acciones de ${row.code}`}
          actions={[
            { label: "Editar", icon: Pencil, onSelect: () => onEditAction(row) },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () => onDeleteAction(row),
            },
          ]}
        />
      )}
    />
  );
}
