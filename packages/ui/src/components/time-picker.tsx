"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const pad = (n: number) => String(n).padStart(2, "0");

/** `HH:MM` -> `[hora, minuto]`. `""` o inválido -> `undefined`. */
function parseTime(value: string): [number, number] | undefined {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return undefined;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h < 24 && m < 60 ? [h, m] : undefined;
}

export type TimePickerProps = {
  /** Hora en formato `HH:MM` (24 h). Cadena vacía = sin seleccionar. */
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Salto de los minutos ofrecidos. Por defecto 5. */
  minuteStep?: number;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

function Column({
  items,
  selected,
  onSelect,
  label,
}: {
  items: number[];
  selected: number | undefined;
  onSelect: (n: number) => void;
  label: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Al abrir, deja visible el valor elegido.
  React.useEffect(() => {
    ref.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div ref={ref} role="listbox" aria-label={label} className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto p-1">
      {items.map((n) => (
        <button
          key={n}
          type="button"
          role="option"
          aria-selected={n === selected}
          data-selected={n === selected}
          onClick={() => onSelect(n)}
          className={cn(
            "rounded-md px-2 py-1.5 text-center text-sm tabular-nums transition-colors hover:bg-accent",
            n === selected && "bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          {pad(n)}
        </button>
      ))}
    </div>
  );
}

/**
 * Selector de hora sobre Popover: dos columnas (horas y minutos). Sustituye al
 * `<input type="time">` nativo. Controlado con cadenas `HH:MM`, pensado para
 * envolver con `Controller` de react-hook-form.
 */
export function TimePicker({
  value,
  onValueChange,
  placeholder = "Selecciona una hora",
  disabled,
  minuteStep = 5,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsed = parseTime(value);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  // Un valor existente fuera del salto (p. ej. 08:07) sigue siendo visible.
  if (parsed && !minutes.includes(parsed[1])) {
    minutes.push(parsed[1]);
    minutes.sort((a, b) => a - b);
  }

  function pick(hour: number | undefined, minute: number | undefined) {
    onValueChange(`${pad(hour ?? 0)}:${pad(minute ?? 0)}`);
  }

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
          <span className={cn("truncate tabular-nums", !parsed && "text-muted-foreground")}>
            {parsed ? `${pad(parsed[0])}:${pad(parsed[1])}` : placeholder}
          </span>
          <Clock className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto divide-x p-0" align="start">
        <Column items={hours} selected={parsed?.[0]} label="Hora" onSelect={(h) => pick(h, parsed?.[1])} />
        <Column
          items={minutes}
          selected={parsed?.[1]}
          label="Minutos"
          onSelect={(m) => {
            pick(parsed?.[0], m);
            if (parsed) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
