"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader, AsyncCombobox } from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useGymClassOptions } from "@/features/tenant/gym-classes";
import { useInstructorOptions } from "@/features/tenant/instructors";
import type { ClassScheduleRow } from "./lib/class-schedules.types";
import { useClassSchedules } from "./lib/class-schedules.hooks";
import { ClassSchedulesTable } from "./components/class-schedules-table";
import { ClassScheduleFormDialog } from "./components/class-schedule-form-dialog";
import { DeleteClassScheduleDialog } from "./components/delete-class-schedule-dialog";
import { ClassScheduleDayFilter } from "./components/class-schedule-day-filter";

const ALL_BRANCHES_OPTION = { value: "", label: "Todas las sedes" };
const ALL_INSTRUCTORS_OPTION = { value: "", label: "Todos los instructores" };
const ALL_GYM_CLASSES_OPTION = { value: "", label: "Todas las clases" };

/** Pantalla de horarios recurrentes: filtros + tabla + alta + edición + borrado. */
export function ClassSchedulesPage() {
  const [branchId, setBranchId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [gymClassId, setGymClassId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [page, setPage] = useState(1);

  const branchOptions = useBranchOptions(true);
  const instructorOptions = useInstructorOptions(true);
  const gymClassOptions = useGymClassOptions(true);

  const schedules = useClassSchedules({
    page,
    branchId: branchId || undefined,
    instructorId: instructorId || undefined,
    gymClassId: gymClassId || undefined,
    dayOfWeek: dayOfWeek ? Number(dayOfWeek) : undefined,
  });
  const meta = schedules.data;

  // Diálogo de alta/edición: "new" para crear, un horario para editar, null cerrado.
  const [editing, setEditing] = useState<ClassScheduleRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ClassScheduleRow | null>(null);

  const hasFilters = Boolean(branchId || instructorId || gymClassId || dayOfWeek);

  function withPageReset(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Horarios"
        description="Repetición semanal de las clases por sede e instructor."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo horario
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <AsyncCombobox
          className="w-48"
          value={gymClassId}
          onValueChange={withPageReset(setGymClassId)}
          source={gymClassOptions}
          selectedOption={ALL_GYM_CLASSES_OPTION}
          placeholder="Clase"
          searchPlaceholder="Buscar clase…"
        />
        <AsyncCombobox
          className="w-48"
          value={instructorId}
          onValueChange={withPageReset(setInstructorId)}
          source={instructorOptions}
          selectedOption={ALL_INSTRUCTORS_OPTION}
          placeholder="Instructor"
          searchPlaceholder="Buscar instructor…"
        />
        <AsyncCombobox
          className="w-48"
          value={branchId}
          onValueChange={withPageReset(setBranchId)}
          source={branchOptions}
          selectedOption={ALL_BRANCHES_OPTION}
          placeholder="Sede"
          searchPlaceholder="Buscar sede…"
        />
        <ClassScheduleDayFilter value={dayOfWeek} onChangeAction={withPageReset(setDayOfWeek)} />
      </div>

      {schedules.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar los horarios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => schedules.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ClassSchedulesTable
          rows={meta?.data ?? []}
          isLoading={schedules.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          emptyMessage={
            hasFilters
              ? "Ningún horario coincide con el filtro."
              : "Aún no hay horarios. Crea el primero."
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: schedules.isFetching,
          }}
        />
      )}

      <ClassScheduleFormDialog
        open={editing !== null}
        schedule={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteClassScheduleDialog
        schedule={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
