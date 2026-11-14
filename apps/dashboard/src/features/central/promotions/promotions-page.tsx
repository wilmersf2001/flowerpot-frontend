"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import {
  ConfirmDialog,
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { PromotionRow } from "./lib/promotions.types";
import { useDeletePromotion, usePromotions } from "./lib/promotions.hooks";
import { PromotionsTable } from "./components/promotions-table";
import { PromotionFormDialog } from "./components/promotion-form-dialog";

export function PromotionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const promotions = usePromotions({ page, search: debouncedSearch });
  const meta = promotions.data;

  const [editing, setEditing] = useState<PromotionRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<PromotionRow | null>(null);
  const remove = useDeletePromotion();

  function handleDelete() {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`Promoción "${deleting.code}" eliminada.`);
        setDeleting(null);
      },
      onError: () => toast.error("No se pudo eliminar la promoción."),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Promociones"
        description="Códigos de descuento que se muestran en la web pública."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nueva promoción
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Buscar por código o nombre…"
      />

      {promotions.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de promociones.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => promotions.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <PromotionsTable
          rows={meta?.data ?? []}
          isLoading={promotions.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ninguna promoción coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: promotions.isFetching,
          }}
        />
      )}

      <PromotionFormDialog
        open={editing !== null}
        promotion={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Eliminar promoción"
        description={`Se eliminará el código ${deleting?.code ?? ""}. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
