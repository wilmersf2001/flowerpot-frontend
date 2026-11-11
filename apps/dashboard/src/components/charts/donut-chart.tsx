"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@repo/ui/lib/utils";
import { ChartEmpty, ChartTooltipCard } from "./chart-parts";
import {
  DEFAULT_CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
  pickColor,
} from "./chart-theme";
import { useChartAnimation } from "./use-chart-animation";

export interface DonutDatum {
  name: string;
  value: number;
}

export interface DonutChartProps {
  data: DonutDatum[];
  /** Colores por porción, en orden. Por defecto `DEFAULT_CHART_COLORS`. */
  colors?: readonly string[];
  /** Formatea el valor en leyenda y tooltip (ej. `formatMoney`). */
  formatValue?: (n: number) => string;
  /** Alto del gráfico en px. */
  height?: number;
  /** Grosor del anillo como fracción del radio (0 = pastel completo). */
  thickness?: number;
  showLegend?: boolean;
  /** Texto accesible; también describe el gráfico a lectores de pantalla. */
  ariaLabel?: string;
  className?: string;
}

const percentOf = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%";

export function DonutChart({
  data,
  colors = DEFAULT_CHART_COLORS,
  formatValue = String,
  height = DEFAULT_CHART_HEIGHT,
  thickness = 0.4,
  showLegend = true,
  ariaLabel = "Distribución",
  className,
}: DonutChartProps) {
  const animate = useChartAnimation();
  const items = data.filter((d) => d.value > 0);
  const total = items.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) return <ChartEmpty height={height} />;

  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      <div role="img" aria-label={ariaLabel} className="shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              innerRadius={`${Math.round((1 - thickness) * 100)}%`}
              outerRadius="100%"
              paddingAngle={items.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={animate}
            >
              {items.map((d, i) => (
                <Cell key={d.name} fill={pickColor(colors, i)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const p = payload?.[0];
                if (!active || !p) return null;
                const value = Number(p.value ?? 0);
                return (
                  <ChartTooltipCard
                    rows={[
                      {
                        label: String(p.name ?? ""),
                        value: `${formatValue(value)} · ${percentOf(value, total)}`,
                        color: (p.payload as { fill?: string } | undefined)?.fill,
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend ? (
        <ul className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm">
          {items.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: pickColor(colors, i) }}
              />
              <span className="truncate">{d.name}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">
                {formatValue(d.value)} · {percentOf(d.value, total)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
