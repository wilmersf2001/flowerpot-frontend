"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  AsyncCombobox,
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import { JobPositionsPage } from "@/features/tenant/job-positions";
import type { StaffRow } from "./lib/staff.types";
import { useJobPositionOptions, useStaff } from "./lib/staff.hooks";
import { StaffTable } from "./components/staff-table";
import { StaffFormDialog } from "./components/staff-form-dialog";
import { DeleteStaffDialog } from "./components/delete-staff-dialog";

/** Pantalla de personal, con una segunda pestaña para administrar los cargos. */
export function StaffPage() {
  return (
    <Tabs defaultValue="staff" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="staff">Personal</TabsTrigger>
        <TabsTrigger value="job-positions">Cargos</TabsTrigger>
      </TabsList>
      <TabsContent value="staff">
        <StaffListSection />
      </TabsContent>
      <TabsContent value="job-positions">
        <JobPositionsPage />
      </TabsContent>
    </Tabs>
  );
}

function StaffListSection() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [jobPosition, setJobPosition] = useState<ComboboxOption | null>(null);

  const jobPositionOptions = useJobPositionOptions();
  const staff = useStaff({
    page,
    search: debouncedSearch,
    job_position_id: jobPosition?.value,
  });
  const meta = staff.data;

  // Diálogo de alta/edición: "new" para crear, un miembro para editar, null cerrado.
  const [editing, setEditing] = useState<StaffRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<StaffRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleJobPosition(option: ComboboxOption | null) {
    setJobPosition(option && option.value ? option : null);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Personal"
        description="Personal del gimnasio, sus cargos y sedes asignadas."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo personal
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={handleSearch}
          placeholder="Buscar por nombre o DNI…"
        />
        <div className="flex items-center gap-1">
          <AsyncCombobox
            value={jobPosition?.value ?? ""}
            onValueChange={(_value, option) => handleJobPosition(option)}
            source={jobPositionOptions}
            selectedOption={jobPosition}
            placeholder="Todos los cargos"
            searchPlaceholder="Buscar cargo…"
            emptyText="Sin cargos."
            className="w-52"
          />
          {jobPosition ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar filtro de cargo"
              onClick={() => handleJobPosition(null)}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {staff.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de personal.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => staff.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <StaffTable
          rows={meta?.data ?? []}
          isLoading={staff.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch || jobPosition
              ?"Ningún miembro del personal coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: staff.isFetching,
          }}
        />
      )}

      <StaffFormDialog
        open={editing !== null}
        staff={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteStaffDialog
        staff={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
