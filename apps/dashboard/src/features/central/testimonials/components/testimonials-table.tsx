"use client";

import { Pencil, Star, Trash2 } from "lucide-react";
import { Switch } from "@repo/ui/switch";
import { toast } from "@repo/ui/toast";
import {
  DataTable,
  RowActions,
  type Column,
  type DataTablePagination,
} from "@/features/_shared";
import { useUpdateTestimonial } from "../lib/testimonials.hooks";
import type { TestimonialRow } from "../lib/testimonials.lib";

export function TestimonialsTable({
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  pagination,
  emptyMessage = "Aún no hay testimonios. Crea el primero.",
}: {
  rows: TestimonialRow[];
  isLoading: boolean;
  onEditAction: (t: TestimonialRow) => void;
  onDeleteAction: (t: TestimonialRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const update = useUpdateTestimonial();
  const pendingId = update.isPending ? update.variables?.id : undefined;

  function toggle(
    t: TestimonialRow,
    field: "is_published" | "is_featured",
    next: boolean,
  ) {
    update.mutate(
      { id: t.id, input: { [field]: next } },
      { onError: () => toast.error("No se pudo actualizar el testimonio.") },
    );
  }

  const columns: Column<TestimonialRow>[] = [
    { key: "sort_order", header: "Orden", cell: (r) => r.sort_order },
    {
      key: "author",
      header: "Autor",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.author_name}</div>
          <div className="text-xs text-muted-foreground">
            {[r.author_role, r.gym_name].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Testimonio",
      cell: (r) => (
        <span className="line-clamp-2 max-w-sm text-muted-foreground">
          {r.content}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Estrellas",
      cell: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-current" />
          {r.rating}
        </span>
      ),
    },
    {
      key: "is_published",
      header: "Publicado",
      cell: (r) => (
        <Switch
          size="sm"
          checked={r.is_published}
          disabled={pendingId === r.id}
          onCheckedChange={(next) => toggle(r, "is_published", next)}
          aria-label={`Publicar testimonio de ${r.author_name}`}
        />
      ),
    },
    {
      key: "is_featured",
      header: "Destacado",
      cell: (r) => (
        <Switch
          size="sm"
          checked={r.is_featured}
          disabled={pendingId === r.id}
          onCheckedChange={(next) => toggle(r, "is_featured", next)}
          aria-label={`Destacar testimonio de ${r.author_name}`}
        />
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
          label={`Acciones de ${row.author_name}`}
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
