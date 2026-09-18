"use client";

import { useState } from "react";
import { DatePicker } from "@repo/ui/date-picker";
import { ResourceHeader, AsyncCombobox } from "@/features/_shared";
import { useInstructorOptions } from "@/features/tenant/instructors";
import type { ClassSessionRow, ClassSessionStatus } from "./lib/class-sessions.types";
import { useClassSessions } from "./lib/class-sessions.hooks";
import { ClassSessionsTable } from "./components/class-sessions-table";
import { ClassSessionFormDialog } from "./components/class-session-form-dialog";
import { ClassSessionStatusFilter } from "./components/class-session-status-filter";

const ALL_INSTRUCTORS_OPTION = { value: "", label: "Todos los instructores" };

/** Pantalla de sesiones: filtros + tabla. Solo lectura + edición puntual (cancelar / reasignar). */
export function ClassSessionsPage() {
  const [instructorId, setInstructorId] = useState("");
  const [status, setStatus] = useState<ClassSessionStatus | "">("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [page, setPage] = useState(1);

  const instructorOptions = useInstructorOptions(true);

  const sessions = useClassSessions({
    page,
    instructorId: instructorId || undefined,
    status: status || undefined,
    sessionDateStart: dateStart || undefined,
    sessionDateEnd: dateEnd || undefined,
  });
  const meta = sessions.data;

  const [editing, setEditing] = useState<ClassSessionRow | null>(null);

  const hasFilters = Boolean(instructorId || status || dateStart || dateEnd);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Sesiones"
        description="Instancias concretas generadas a partir de los horarios recurrentes."
      />

      <div className="flex flex-wrap items-center gap-3">
        <AsyncCombobox
          className="w-48"
          value={instructorId}
          onValueChange={withPageReset(setInstructorId)}
          source={instructorOptions}
          selectedOption={ALL_INSTRUCTORS_OPTION}
          placeholder="Instructor"
          searchPlaceholder="Buscar instructor…"
        />
        <ClassSessionStatusFilter value={status} onChangeAction={withPageReset(setStatus)} />
        <DatePicker
          value={dateStart}
          onValueChange={withPageReset(setDateStart)}
          placeholder="Desde"
          toDate={dateEnd ? new Date(dateEnd) : undefined}
        />
        <DatePicker
          value={dateEnd}
          onValueChange={withPageReset(setDateEnd)}
          placeholder="Hasta"
          fromDate={dateStart ? new Date(dateStart) : undefined}
        />
      </div>

      {sessions.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar las sesiones.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => sessions.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ClassSessionsTable
          rows={meta?.data ?? []}
          isLoading={sessions.isPending}
          onEditAction={setEditing}
          emptyMessage={
            hasFilters ? "Ninguna sesión coincide con el filtro." : "Aún no hay sesiones generadas."
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: sessions.isFetching,
          }}
        />
      )}

      <ClassSessionFormDialog
        open={editing !== null}
        session={editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
