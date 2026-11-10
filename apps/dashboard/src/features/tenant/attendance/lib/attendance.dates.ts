/** Utilidades de fecha-calendario (`YYYY-MM-DD` / `YYYY-MM`) sin depender de la zona horaria. */

const pad = (n: number) => String(n).padStart(2, "0");

export function toMonthKey(year: number, monthIndex: number): string {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${toMonthKey(year, monthIndex)}-${pad(day)}`;
}

export function todayKey(): string {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return toMonthKey(d.getUTCFullYear(), d.getUTCMonth());
}

/** Celdas del mes en una grilla lunes→domingo; `null` = relleno fuera del mes. */
export function buildMonthGrid(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateKey(y, m - 1, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Fecha-calendario a mediodía local, segura para `Intl` sin saltos de día. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d, 12);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthTitle(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return capitalize(
    new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(
      new Date(y, m - 1, 1, 12),
    ),
  );
}

export function formatDayTitle(key: string): string {
  return capitalize(
    new Intl.DateTimeFormat("es-PE", { dateStyle: "full" }).format(parseDateKey(key)),
  );
}

export function formatHour(hour: number): string {
  return `${pad(hour)}:00`;
}
