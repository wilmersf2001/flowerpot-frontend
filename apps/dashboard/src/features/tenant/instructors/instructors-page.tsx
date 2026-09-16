"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { SpecialtiesPage } from "@/features/tenant/specialties";
import { InstructorSchedulesDialog } from "@/features/tenant/instructor-schedules";
import type { InstructorRow } from "./lib/instructors.types";
import { useInstructors } from "./lib/instructors.hooks";
import { InstructorsTable } from "./components/instructors-table";
import { InstructorFormDialog } from "./components/instructor-form-dialog";
import { DeleteInstructorDialog } from "./components/delete-instructor-dialog";

/** Pantalla de instructores, con una segunda pestaña para administrar las especialidades. */
export function InstructorsPage() {
  return (
    <Tabs defaultValue="instructors" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="instructors">Instructores</TabsTrigger>
        <TabsTrigger value="specialties">Especialidades</TabsTrigger>
      </TabsList>
      <TabsContent value="instructors">
        <InstructorsListSection />
      </TabsContent>
      <TabsContent value="specialties">
        <SpecialtiesPage />
      </TabsContent>
    </Tabs>
  );
}

function InstructorsListSection() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const instructors = useInstructors({ page, search: debouncedSearch });
  const meta = instructors.data;

  // Diálogo de alta/edición: "new" para crear, un instructor para editar, null cerrado.
  const [editing, setEditing] = useState<InstructorRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<InstructorRow | null>(null);
  const [schedulesFor, setSchedulesFor] = useState<InstructorRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Instructores"
        description="Personal que dicta clases, sus especialidades y disponibilidad."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo instructor
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por biografía…"
      />

      {instructors.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de instructores.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => instructors.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <InstructorsTable
          rows={meta?.data ?? []}
          isLoading={instructors.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          onSchedulesAction={setSchedulesFor}
          emptyMessage={
            debouncedSearch ? "Ningún instructor coincide con la búsqueda." : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: instructors.isFetching,
          }}
        />
      )}

      <InstructorFormDialog
        open={editing !== null}
        instructor={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteInstructorDialog
        instructor={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
      <InstructorSchedulesDialog
        open={schedulesFor !== null}
        instructorId={schedulesFor?.id ?? null}
        instructorName={schedulesFor?.staff?.full_name}
        onOpenChangeAction={(open) => {
          if (!open) setSchedulesFor(null);
        }}
      />
    </div>
  );
}
