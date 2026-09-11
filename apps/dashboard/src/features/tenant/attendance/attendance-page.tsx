"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { AttendanceRow } from "./lib/attendance.types";
import { useAttendances } from "./lib/attendance.hooks";
import { AttendanceTable } from "./components/attendance-table";
import { AttendanceFormDialog } from "./components/attendance-form-dialog";
import { DeleteAttendanceDialog } from "./components/delete-attendance-dialog";

/** Pantalla de asistencias: lista + búsqueda + paginación + registro manual + borrado. */
export function AttendancePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const attendances = useAttendances({ page, search: debouncedSearch });
  const meta = attendances.data;

  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Asistencia"
        description="Historial de asistencia de socios."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Registrar asistencia
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por socio…"
      />

      {attendances.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el historial de asistencia.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => attendances.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <AttendanceTable
          rows={meta?.data ?? []}
          isLoading={attendances.isPending}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch
              ? "Ninguna asistencia coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: attendances.isFetching,
          }}
        />
      )}

      <AttendanceFormDialog open={creating} onOpenChangeAction={setCreating} />
      <DeleteAttendanceDialog
        attendance={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
