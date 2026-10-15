"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import type { AttendanceCalendar } from "../lib/attendance.types";
import {
  buildMonthGrid,
  formatDayTitle,
  formatHour,
  formatMonthTitle,
  shiftMonth,
  todayKey,
} from "../lib/attendance.dates";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Intensidad del mapa de calor en 4 niveles, relativa al día más fuerte del mes. */
function heatClass(total: number, max: number): string {
  if (total <= 0 || max <= 0) return "bg-muted/30";
  const ratio = total / max;
  if (ratio > 0.75) return "bg-primary/60";
  if (ratio > 0.5) return "bg-primary/40";
  if (ratio > 0.25) return "bg-primary/25";
  return "bg-primary/10";
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AttendanceKpis({ data }: { data: AttendanceCalendar | undefined }) {
  const s = data?.summary;
  const busiest = s?.busiest_day;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label="Asistencias del mes" value={s ? String(s.total) : "—"} />
      <Kpi label="Socios distintos" value={s ? String(s.unique_members) : "—"} />
      <Kpi
        label="Promedio por día"
        value={s ? s.avg_per_day.toLocaleString("es-PE", { maximumFractionDigits: 1 }) : "—"}
      />
      <Kpi
        label="Hora pico"
        value={s?.peak_hour != null ? formatHour(s.peak_hour) : "—"}
        hint={busiest ? `Día más fuerte: ${busiest.date.slice(8)} (${busiest.total})` : undefined}
      />
    </div>
  );
}

export function AttendanceCalendarGrid({
  month,
  onMonthChangeAction,
  data,
  isLoading,
  selectedDate,
  onSelectDateAction,
}: {
  month: string;
  onMonthChangeAction: (month: string) => void;
  data: AttendanceCalendar | undefined;
  isLoading: boolean;
  selectedDate: string | null;
  onSelectDateAction: (date: string) => void;
}) {
  const today = todayKey();
  const totals = new Map(data?.days.map((d) => [d.date, d]));
  const max = Math.max(0, ...(data?.days.map((d) => d.total) ?? []));

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{formatMonthTitle(month)}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onMonthChangeAction(today.slice(0, 7));
              onSelectDateAction(today);
            }}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Mes anterior"
            onClick={() => onMonthChangeAction(shiftMonth(month, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Mes siguiente"
            onClick={() => onMonthChangeAction(shiftMonth(month, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1">
            {w}
          </div>
        ))}
        {buildMonthGrid(month).map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;
          const total = totals.get(date)?.total ?? 0;
          const selected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDateAction(date)}
              aria-label={`${formatDayTitle(date)}: ${total} asistencias`}
              aria-pressed={selected}
              className={cn(
                "flex aspect-square min-h-12 flex-col items-center justify-center rounded-lg text-foreground transition-colors hover:ring-2 hover:ring-primary/40",
                isLoading ? "bg-muted/30" : heatClass(total, max),
                date === today && "font-bold",
                selected && "ring-2 ring-primary",
              )}
            >
              <span className="text-sm">{Number(date.slice(8))}</span>
              {total > 0 ? (
                <span className="text-[11px] tabular-nums text-muted-foreground">{total}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
