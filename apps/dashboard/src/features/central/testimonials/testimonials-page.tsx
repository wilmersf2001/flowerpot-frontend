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
import type { TestimonialRow } from "./lib/testimonials.lib";
import {
  useDeleteTestimonial,
  useTestimonials,
} from "./lib/testimonials.hooks";
import { TestimonialsTable } from "./components/testimonials-table";
import { TestimonialFormDialog } from "./components/testimonial-form-dialog";

export function TestimonialsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const testimonials = useTestimonials({ page, search: debouncedSearch });
  const meta = testimonials.data;

  const [editing, setEditing] = useState<TestimonialRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<TestimonialRow | null>(null);
  const remove = useDeleteTestimonial();

  function handleDelete() {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Testimonio eliminado.");
        setDeleting(null);
      },
      onError: () => toast.error("No se pudo eliminar el testimonio."),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Testimonios"
        description="Opiniones de clientes que se muestran en la web pública."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo testimonio
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Buscar por autor o gimnasio…"
      />

      {testimonials.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de testimonios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => testimonials.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <TestimonialsTable
          rows={meta?.data ?? []}
          isLoading={testimonials.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ningún testimonio coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: testimonials.isFetching,
          }}
        />
      )}

      <TestimonialFormDialog
        open={editing !== null}
        testimonial={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Eliminar testimonio"
        description={`Se eliminará el testimonio de ${deleting?.author_name ?? ""}. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
