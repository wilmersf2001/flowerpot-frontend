"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { EM_DASH, SearchInput, formatDateTime, useDebouncedValue } from "@/features/_shared";
import { ATTENDANCE_DAY_PER_PAGE } from "../lib/attendance.constants";
import { formatDayTitle, parseDateKey } from "../lib/attendance.dates";
import { useAttendances } from "../lib/attendance.hooks";
import type { AttendanceRow } from "../lib/attendance.types";

const SOURCE_LABEL: Record<string, string> = {
  qr: "QR",
  biometric: "Biométrico",
  manual: "Manual",
};

type MembershipState = "expired" | "expiring" | "ok" | "none";

function membershipState(endsAt: string | undefined, day: string): MembershipState {
  if (!endsAt) return "none";
  const diffDays = Math.round(
    (parseDateKey(endsAt.slice(0, 10)).getTime() - parseDateKey(day).getTime()) / 86_400_000,
  );
  if (diffDays < 0) return "expired";
  return diffDays <= 7 ? "expiring" : "ok";
}

const MEMBERSHIP_BADGE: Record<MembershipState, { text: string; className: string } | null> = {
  expired: { text: "Membresía vencida", className: "bg-destructive/10 text-destructive" },
  expiring: { text: "Por vencer", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  ok: null,
  none: null,
};

/** Mini gráfica de asistencias por hora, calculada de las filas del día. */
function HourlyBars({ rows }: { rows: AttendanceRow[] }) {
  const byHour = new Map<number, number>();
  for (const r of rows) {
    const hour = Number(r.checked_in_at.slice(11, 13));
    if (!Number.isNaN(hour)) byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
  }
  if (byHour.size === 0) return null;
  const hours = [...byHour.keys()];
  const min = Math.min(...hours);
  const max = Math.max(...hours);
  const peak = Math.max(...byHour.values());
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="flex h-16 items-end gap-1" aria-label="Asistencias por hora">
      {range.map((h) => {
        const n = byHour.get(h) ?? 0;
        return (
          <div key={h} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${h}:00 — ${n}`}>
            <div
              className={cn("w-full rounded-sm", n ? "bg-primary/60" : "bg-muted")}
              style={{ height: `${Math.max(n ? 12 : 4, (n / peak) * 100)}%` }}
            />
            <span className="text-[10px] tabular-nums text-muted-foreground">{h}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AttendanceDayPanel({
  date,
  onDeleteAction,
}: {
  date: string | null;
  onDeleteAction: (attendance: AttendanceRow) => void;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 300);
  const query = useAttendances({
    date: date ?? undefined,
    search: debounced,
    perPage: ATTENDANCE_DAY_PER_PAGE,
  });
  const rows = date ? (query.data?.data ?? []) : [];

  if (!date) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Selecciona un día del calendario para ver quién asistió.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">{formatDayTitle(date)}</h3>
        <p className="text-sm text-muted-foreground">
          {query.isPending ? "Cargando…" : `${query.data?.total ?? rows.length} asistencias`}
        </p>
      </div>

      <HourlyBars rows={rows} />
      <SearchInput value={search} onChangeAction={setSearch} placeholder="Buscar socio del día…" />

      {query.isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar el día.{" "}
          <button type="button" className="underline" onClick={() => query.refetch()}>
            Reintentar
          </button>
        </p>
      ) : rows.length === 0 && !query.isPending ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {debounced ? "Ningún socio coincide." : "Sin asistencias este día."}
        </p>
      ) : (
        <ul className="flex max-h-[28rem] flex-col divide-y overflow-y-auto">
          {rows.map((row) => {
            const badge = MEMBERSHIP_BADGE[membershipState(row.membership?.ends_at, date)];
            return (
              <li key={row.id} className="flex items-center gap-3 py-2.5">
                <span className="w-14 shrink-0 text-sm tabular-nums text-muted-foreground">
                  {formatDateTime(row.checked_in_at, { timeStyle: "short" })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {row.member?.full_name || row.member_name || row.member_id}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.member?.dni ?? EM_DASH} · {SOURCE_LABEL[row.source] ?? row.source}
                  </p>
                </div>
                {badge ? (
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px]", badge.className)}>
                    {badge.text}
                  </span>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar asistencia de ${row.member?.full_name ?? row.member_id}`}
                  onClick={() => onDeleteAction(row)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
