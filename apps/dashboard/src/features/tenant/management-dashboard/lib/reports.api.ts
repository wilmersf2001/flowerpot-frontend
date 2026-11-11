import { apiClient } from "@repo/api-client";
import { filenameFromDisposition } from "@/features/_shared";
import {
  EXCEL_MIME,
  REPORTS_ENDPOINT,
  REPORT_EXPORT_TIMEOUT_MS,
  type ReportType,
} from "./management.constants";
import type { ManagementParams } from "./management.types";

export interface ReportFile {
  blob: Blob;
  filename: string;
}

/** Descarga un reporte Excel (binario: se pide como blob, con el token vía proxy). */
export async function fetchReport(
  type: ReportType,
  { month, year }: ManagementParams,
): Promise<ReportFile> {
  const response = await apiClient.get<Blob>(`${REPORTS_ENDPOINT}/${type}/export`, {
    params: { month, year },
    responseType: "blob",
    timeout: REPORT_EXPORT_TIMEOUT_MS,
    headers: { Accept: EXCEL_MIME },
  });
  return {
    blob: response.data,
    filename:
      filenameFromDisposition(response.headers["content-disposition"]) ??
      `reporte_${type}_${month ?? "actual"}_${year ?? ""}.xlsx`,
  };
}
