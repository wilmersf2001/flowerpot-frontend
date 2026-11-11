import { fetchPdf, type PdfFile } from "@/features/_shared";
import {
  PDF_REPORTS_ENDPOINT,
  PDF_REPORT_TIMEOUT_MS,
  type PdfReportType,
} from "./management.constants";
import type { ManagementParams } from "./management.types";

/** Descarga un reporte PDF profesional del mes/año indicado. */
export function fetchPdfReport(
  type: PdfReportType,
  { month, year }: ManagementParams,
): Promise<PdfFile> {
  return fetchPdf(
    `${PDF_REPORTS_ENDPOINT}/${type}`,
    { month: month?.toString(), year: year?.toString(), format: "pdf" },
    PDF_REPORT_TIMEOUT_MS,
  );
}
