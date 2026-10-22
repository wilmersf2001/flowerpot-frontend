"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader } from "@/features/_shared";
import { useInstructor } from "@/features/tenant/instructors";
import { useInstructorSchedules } from "../lib/instructor-schedules.hooks";
import { InstructorSchedulesTable } from "./instructor-schedules-table";
import { InstructorScheduleFormDialog } from "./instructor-schedule-form-dialog";
import { DeleteInstructorScheduleDialog } from "./delete-instructor-schedule-dialog";
import type { InstructorScheduleRow } from "../lib/instructor-schedules.types";

/**
 * Pantalla de disponibilidad semanal de un instructor (`/instructors/[id]/schedules`).
 * Lista los `instructor-schedules` acotados a él; el alta/edición es un único
 * diálogo sobre la página y el borrado una confirmación.
 */
export function InstructorSchedulesPage({ instructorId }: { instructorId: string }) {
  const instructor = useInstructor(instructorId);
  const schedules = useInstructorSchedules({ instructor_id: instructorId });

  // Diálogo de alta/edición: "new" para crear, un horario para editar, null cerrado.
  const [editing, setEditing] = useState<InstructorScheduleRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<InstructorScheduleRow | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/instructors"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a instructores
      </Link>

      <ResourceHeader
        title={`Horarios de ${instructor.data?.staff?.full_name ?? "instructor"}`}
        description="Disponibilidad semanal recurrente por sede."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo horario
          </Button>
        }
      />

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
        <InstructorSchedulesTable
          rows={schedules.data?.data ?? []}
          isLoading={schedules.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
        />
      )}

      <InstructorScheduleFormDialog
        open={editing !== null}
        instructorId={instructorId}
        schedule={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteInstructorScheduleDialog
        schedule={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
