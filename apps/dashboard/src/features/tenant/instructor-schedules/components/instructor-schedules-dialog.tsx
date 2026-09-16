"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { AppDialog } from "@/features/_shared";
import { useInstructorSchedules } from "../lib/instructor-schedules.hooks";
import { InstructorSchedulesTable } from "./instructor-schedules-table";
import { InstructorScheduleFormDialog } from "./instructor-schedule-form-dialog";
import { DeleteInstructorScheduleDialog } from "./delete-instructor-schedule-dialog";
import type { InstructorScheduleRow } from "../lib/instructor-schedules.types";

/**
 * Diálogo de disponibilidad semanal de un instructor. Se abre desde la fila
 * del instructor en la tabla principal: recibe su `id` y nombre, y administra
 * (lista + alta + edición + borrado) los `instructor-schedules` acotados a él.
 */
export function InstructorSchedulesDialog({
  open,
  instructorId,
  instructorName,
  onOpenChangeAction,
}: {
  open: boolean;
  instructorId: string | null;
  instructorName?: string;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const schedules = useInstructorSchedules({ instructorId: instructorId ?? "" });

  // Diálogo de alta/edición: "new" para crear, un horario para editar, null cerrado.
  const [editing, setEditing] = useState<InstructorScheduleRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<InstructorScheduleRow | null>(null);

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={onOpenChangeAction}
        className="max-w-2xl"
        title={`Horarios de ${instructorName ?? "instructor"}`}
        description="Disponibilidad semanal recurrente por sede."
        footer={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo horario
          </Button>
        }
      >
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
      </AppDialog>

      {instructorId ? (
        <>
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
        </>
      ) : null}
    </>
  );
}
