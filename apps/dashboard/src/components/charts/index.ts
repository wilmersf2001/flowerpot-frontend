"use client";

/**
 * Gráficos reutilizables (Recharts).
 *
 * Se exportan con carga diferida: Recharts (~100 KB) solo se descarga cuando
 * un gráfico llega a renderizarse, no en el bundle inicial de la ruta.
 * Cada gráfico es independiente: recibe datos, colores y formato por props y
 * no conoce ninguna feature. Para añadir uno nuevo: crear `<nombre>-chart.tsx`
 * y registrarlo aquí.
 */
import dynamic from "next/dynamic";
import { createElement } from "react";
import { ChartSkeleton } from "./chart-parts";
import { DEFAULT_CHART_HEIGHT } from "./chart-theme";

const skeleton = ({ height = DEFAULT_CHART_HEIGHT }: { height?: number }) =>
  createElement(ChartSkeleton, { height });

export const DonutChart = dynamic(
  () => import("./donut-chart").then((m) => m.DonutChart),
  { ssr: false, loading: () => skeleton({}) },
);

export const LineChart = dynamic(
  () => import("./line-chart").then((m) => m.LineChart),
  { ssr: false, loading: () => skeleton({}) },
);

export type { DonutChartProps, DonutDatum } from "./donut-chart";
export type { LineChartProps, LineSeries } from "./line-chart";
export { DEFAULT_CHART_COLORS } from "./chart-theme";
