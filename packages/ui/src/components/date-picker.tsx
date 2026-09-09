"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { cn } from "../lib/utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/** Formato de intercambio con el formulario: `YYYY-MM-DD` (fecha sin hora). */
const WIRE_FORMAT = "yyyy-MM-dd";
/** Cómo se muestra la fecha elegida en el disparador. */
const DISPLAY_FORMAT = "d 'de' MMMM 'de' yyyy";

/** `YYYY-MM-DD` -> `Date` local (sin desfase de zona horaria). `""` -> `undefined`. */
function wireToDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = parse(value, WIRE_FORMAT, new Date());
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Rango de años que ofrecen los desplegables de mes/año, relativo al año actual. */
const DEFAULT_YEARS_BACK = 100;
const DEFAULT_YEARS_FORWARD = 10;

export type DatePickerProps = {
  /** Fecha en formato `YYYY-MM-DD`. Cadena vacía = sin seleccionar. */
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Deshabilita días fuera de rango. Ej.: `{ before: new Date() }`. */
  fromDate?: Date;
  toDate?: Date;
  /** Primer mes navegable / primer año del desplegable. Por defecto: hoy − 100 años. */
  startMonth?: Date;
  /** Último mes navegable / último año del desplegable. Por defecto: hoy + 10 años. */
  endMonth?: Date;
  id?: string;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Selector de fecha sobre shadcn (Popover + Calendar). Sustituye al
 * `<input type="date">` nativo. Controlado: `value` / `onValueChange` con
 * cadenas `YYYY-MM-DD` (pensado para envolver con `Controller` de
 * react-hook-form).
 */
export function DatePicker({
  value,
  onValueChange,
  placeholder = "Selecciona una fecha",
  disabled,
  fromDate,
  toDate,
  startMonth,
  endMonth,
  id,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = wireToDate(value);

  const disabledDays: Matcher[] = [];
  if (fromDate) disabledDays.push({ before: fromDate });
  if (toDate) disabledDays.push({ after: toDate });

  // Rango navegable de los desplegables de mes/año. Si el llamador acota con
  // `fromDate`/`toDate`, ese límite manda; si no, un rango amplio por defecto.
  const rangeStart =
    startMonth ??
    fromDate ??
    new Date(new Date().getFullYear() - DEFAULT_YEARS_BACK, 0, 1);
  const rangeEnd =
    endMonth ??
    toDate ??
    new Date(new Date().getFullYear() + DEFAULT_YEARS_FORWARD, 11, 31);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected
              ? format(selected, DISPLAY_FORMAT, { locale: es })
              : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-auto p-0", contentClassName)}
      >
        <Calendar
          mode="single"
          autoFocus
          captionLayout="dropdown"
          startMonth={rangeStart}
          endMonth={rangeEnd}
          defaultMonth={selected}
          selected={selected}
          disabled={disabledDays.length ? disabledDays : undefined}
          onSelect={(date) => {
            onValueChange(date ? format(date, WIRE_FORMAT) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
