import { cn } from "@repo/ui/lib/utils";

/** Placeholder con la misma altura que el gráfico real: evita saltos de layout al cargar. */
export function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      aria-hidden
      className="w-full animate-pulse rounded-lg bg-muted/60"
      style={{ height }}
    />
  );
}

export function ChartEmpty({
  text = "Sin datos para este período.",
  height,
}: {
  text?: string;
  height?: number;
}) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={height ? { height } : undefined}
    >
      {text}
    </div>
  );
}

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

/** Contenido de tooltip con el estilo del tema (independiente de la librería). */
export function ChartTooltipCard({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: TooltipRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
        className,
      )}
    >
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <ul className="flex flex-col gap-0.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            {r.color ? (
              <span className="size-2 rounded-full" style={{ background: r.color }} />
            ) : null}
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
