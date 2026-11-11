"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { toast } from "@repo/ui/toast";
import { pdfErrorMessage, saveBlob } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import {
  EXPORT_PDF_PERMISSION,
  MONTH_NAMES,
  PDF_REPORT_TYPES,
  type PdfReportType,
} from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import { fetchPdfReport } from "../lib/pdf-reports.api";

/** Menú "Exportar PDF": reportes formales del mes/año seleccionado. */
export function ExportPdfReportsMenu({ params }: { params: ManagementParams }) {
  const hasPermission = useHasPermission();
  const [exporting, setExporting] = useState<PdfReportType | null>(null);

  const available = PDF_REPORT_TYPES.filter((r) => hasPermission(r.permission));
  if (!hasPermission(EXPORT_PDF_PERMISSION) || available.length === 0) return null;

  const period = `${MONTH_NAMES[(params.month ?? 1) - 1]} ${params.year}`;

  async function handleExport(type: PdfReportType, label: string) {
    if (exporting) return;
    setExporting(type);
    const toastId = toast.loading(`Generando PDF ${label}…`);
    try {
      const file = await fetchPdfReport(type, params);
      saveBlob(
        file.blob,
        file.filename ?? `reporte_${type}_${params.month ?? "actual"}_${params.year ?? ""}.pdf`,
      );
      toast.success("PDF descargado.", { id: toastId });
    } catch (err) {
      toast.error(
        await pdfErrorMessage(err, "No se pudo generar el PDF. Intenta nuevamente."),
        { id: toastId },
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting !== null}>
          {exporting ? <Loader2 className="animate-spin" /> : <FileText />}
          {exporting ? "Generando…" : "Exportar PDF"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Reportes PDF de {period}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((r) => (
          <DropdownMenuItem
            key={r.value}
            disabled={exporting !== null}
            onSelect={() => void handleExport(r.value, r.label)}
            className="items-start gap-2"
          >
            <FileText className="mt-0.5 size-4 shrink-0" />
            <span className="flex flex-col">
              <span className="font-medium">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
