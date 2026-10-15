"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { AttendanceRow } from "./lib/attendance.types";
import { useAttendanceCalendar, useAttendances } from "./lib/attendance.hooks";
import { todayKey } from "./lib/attendance.dates";
import { AttendanceTable } from "./components/attendance-table";
import { AttendanceFormDialog } from "./components/attendance-form-dialog";
import { DeleteAttendanceDialog } from "./components/delete-attendance-dialog";
import { AttendanceCalendarGrid, AttendanceKpis } from "./components/attendance-calendar";
import { AttendanceDayPanel } from "./components/attendance-day-panel";

/** Pantalla de asistencias: calendario mensual + detalle del día, e historial en tabla. */
export function AttendancePage() {
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceRow | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Asistencia"
        description="Quién asistió y cuándo: calendario mensual e historial de socios."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Registrar asistencia
          </Button>
        }
      />

      <Tabs defaultValue="calendar" className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarView onDeleteAction={setDeleting} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryView onDeleteAction={setDeleting} />
        </TabsContent>
      </Tabs>

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

function CalendarView({ onDeleteAction }: { onDeleteAction: (a: AttendanceRow) => void }) {
  const [month, setMonth] = useState(() => todayKey().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(() => todayKey());
  const calendar = useAttendanceCalendar(month);

  return (
    <div className="flex flex-col gap-6">
      <AttendanceKpis data={calendar.data} />
      {calendar.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el calendario.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => calendar.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <AttendanceCalendarGrid
            month={month}
            onMonthChangeAction={setMonth}
            data={calendar.data}
            isLoading={calendar.isPending}
            selectedDate={selectedDate}
            onSelectDateAction={setSelectedDate}
          />
          <AttendanceDayPanel
            key={selectedDate ?? "none"}
            date={selectedDate}
            onDeleteAction={onDeleteAction}
          />
        </div>
      )}
    </div>
  );
}

function HistoryView({ onDeleteAction }: { onDeleteAction: (a: AttendanceRow) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const attendances = useAttendances({ page, search: debouncedSearch });
  const meta = attendances.data;

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
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
          onDeleteAction={onDeleteAction}
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
    </div>
  );
}
