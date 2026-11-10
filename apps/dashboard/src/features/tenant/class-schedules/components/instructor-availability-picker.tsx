"use client";

import Link from "next/link";
import { CalendarClock, TriangleAlert } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  useInstructorSchedules,
  type InstructorScheduleRow,
} from "@/features/tenant/instructor-schedules";
import { DAY_OF_WEEK_LABELS } from "../lib/class-schedules.constants";

/** `HH:MM:SS` -> `HH:MM`. */
const hhmm = (value: string) => value.slice(0, 5);

export type AvailabilityValue = {
  branch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

function matches(slot: InstructorScheduleRow, value: AvailabilityValue) {
  return (
    String(slot.branch_id) === value.branch_id &&
    String(slot.day_of_week) === value.day_of_week
  );
}

/**
 * Lista la disponibilidad semanal del instructor elegido para precargar sede,
 * día y horas del horario de clase con un clic. Solo es una ayuda: los campos
 * siguen editables y, si el horario queda fuera del bloque, avisa sin bloquear.
 */
export function InstructorAvailabilityPicker({
  instructorId,
  value,
  onPick,
}: {
  instructorId: string;
  value: AvailabilityValue;
  onPick: (slot: InstructorScheduleRow) => void;
}) {
  const schedules = useInstructorSchedules({ instructor_id: instructorId });
  const slots = (schedules.data?.data ?? []).filter((slot) => !slot.deleted_at);

  // Si ya eligieron sede o día, deja solo los bloques compatibles.
  const visible = slots.filter(
    (slot) =>
      (!value.branch_id || String(slot.branch_id) === value.branch_id) &&
      (!value.day_of_week || String(slot.day_of_week) === value.day_of_week),
  );
  const shown = visible.length > 0 ? visible : slots;

  const isActive = (slot: InstructorScheduleRow) =>
    matches(slot, value) &&
    hhmm(slot.start_time) === value.start_time &&
    hhmm(slot.end_time) === value.end_time;

  // Aviso suave: hay horas completas y ningún bloque del instructor las contiene.
  const hasTimes = Boolean(value.branch_id && value.day_of_week && value.start_time && value.end_time);
  const outside =
    hasTimes &&
    slots.length > 0 &&
    !slots.some(
      (slot) =>
        matches(slot, value) &&
        value.start_time >= hhmm(slot.start_time) &&
        value.end_time <= hhmm(slot.end_time),
    );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CalendarClock className="size-3.5" aria-hidden />
        Disponibilidad del instructor
      </p>

      {schedules.isPending ? (
        <p className="text-xs text-muted-foreground">Cargando horarios…</p>
      ) : schedules.isError ? (
        <p className="text-xs text-destructive">No se pudo cargar la disponibilidad.</p>
      ) : slots.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Este instructor no tiene horarios.{" "}
          <Link
            href={`/instructors/${instructorId}/schedules`}
            className="underline underline-offset-2"
          >
            Registrar disponibilidad
          </Link>
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {shown.map((slot) => (
              <button
                key={slot.id}
                type="button"
                aria-pressed={isActive(slot)}
                onClick={() => onPick(slot)}
                className={cn(
                  "rounded-md border bg-background px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                  isActive(slot) && "border-primary bg-primary/10 text-primary hover:bg-primary/10",
                )}
              >
                <span className="font-medium">{DAY_OF_WEEK_LABELS[slot.day_of_week]}</span>{" "}
                <span className="tabular-nums">
                  {hhmm(slot.start_time)}–{hhmm(slot.end_time)}
                </span>
                {slot.branch ? (
                  <span className="text-muted-foreground"> · {slot.branch.name}</span>
                ) : null}
              </button>
            ))}
          </div>
          {outside ? (
            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
              <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
              Este horario queda fuera de la disponibilidad registrada del instructor.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
