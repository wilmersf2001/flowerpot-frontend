"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@repo/ui/lib/utils";
import { ChartEmpty, ChartTooltipCard } from "./chart-parts";
import {
  CHART_TOKENS,
  DEFAULT_CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
  pickColor,
} from "./chart-theme";
import { useChartAnimation } from "./use-chart-animation";

export interface LineSeries {
  /** Clave del valor dentro de cada fila de `data`. */
  key: string;
  /** Nombre mostrado en tooltip/leyenda. */
  label: string;
  /** Si se omite, se toma de `colors` según el orden. */
  color?: string;
  /** Trazo punteado (ej. predicción). */
  dashed?: boolean;
}

export interface LineChartProps {
  /** Una fila por punto del eje X: `{ [xKey]: "Ene", ventas: 10, meta: 12 }`. */
  data: Array<Record<string, string | number | null>>;
  /** Clave de la fila usada como etiqueta del eje X. */
  xKey: string;
  series: LineSeries[];
  colors?: readonly string[];
  /** Formatea los valores del eje Y y del tooltip. */
  formatValue?: (n: number) => string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function LineChart({
  data,
  xKey,
  series,
  colors = DEFAULT_CHART_COLORS,
  formatValue = String,
  height = DEFAULT_CHART_HEIGHT,
  showGrid = true,
  showLegend = false,
  ariaLabel = "Evolución",
  className,
}: LineChartProps) {
  const animate = useChartAnimation();
  const resolved = series.map((s, i) => ({ ...s, color: s.color ?? pickColor(colors, i) }));

  if (data.length < 2) return <ChartEmpty height={height} />;

  return (
    <div className={className}>
      <div role="img" aria-label={ariaLabel} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            {showGrid ? (
              <CartesianGrid vertical={false} stroke={CHART_TOKENS.grid} strokeDasharray="3 3" />
            ) : null}
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: CHART_TOKENS.text }}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: CHART_TOKENS.text }}
              tickFormatter={(v) => formatValue(Number(v))}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: CHART_TOKENS.grid }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipCard
                    title={String(label ?? "")}
                    rows={payload
                      .filter((p) => p.value != null)
                      .map((p) => ({
                        label: String(p.name ?? p.dataKey ?? ""),
                        value: formatValue(Number(p.value)),
                        color: p.color,
                      }))}
                  />
                );
              }}
            />
            {resolved.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                strokeDasharray={s.dashed ? "5 5" : undefined}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
                isAnimationActive={animate}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      {showLegend ? (
        <ul className={cn("mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground")}>
          {resolved.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
