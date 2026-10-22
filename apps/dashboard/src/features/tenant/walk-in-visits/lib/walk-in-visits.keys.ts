import type { VisitorsReportParams, WalkInVisitListParams } from "./walk-in-visits.types";

/** Fábrica de query-keys de React Query para visitas sin membresía. */
export const walkInVisitKeys = {
  all: ["walk-in-visits"] as const,
  lists: () => [...walkInVisitKeys.all, "list"] as const,
  list: (params: WalkInVisitListParams) => [...walkInVisitKeys.lists(), params] as const,
  report: (params: VisitorsReportParams) => [...walkInVisitKeys.all, "report", params] as const,
};
