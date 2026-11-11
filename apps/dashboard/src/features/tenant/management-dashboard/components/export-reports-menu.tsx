"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
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
  EXPORT_REPORTS_PERMISSION,
  MONTH_NAMES,
  REPORT_TYPES,
  type ReportType,
} from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import { fetchReport } from "../lib/reports.api";

/** Menú "Exportar Excel": un reporte por opción, del mes/año seleccionado. */
export function ExportReportsMenu({ params }: { params: ManagementParams }) {
  const hasPermission = useHasPermission();
  const [exporting, setExporting] = useState<ReportType | null>(null);

  if (!hasPermission(EXPORT_REPORTS_PERMISSION)) return null;

  const period = `${MONTH_NAMES[(params.month ?? 1) - 1]} ${params.year}`;

  async function handleExport(type: ReportType, label: string) {
    if (exporting) return; // evita descargas simultáneas
    setExporting(type);
    const toastId = toast.loading(`Generando reporte ${label}…`);
    try {
      const file = await fetchReport(type, params);
      saveBlob(file.blob, file.filename);
      toast.success("Reporte descargado.", { id: toastId });
    } catch (err) {
      toast.error(
        await pdfErrorMessage(err, "No se pudo generar el reporte. Intenta nuevamente."),
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
          {exporting ? <Loader2 className="animate-spin" /> : <Download />}
          {exporting ? "Generando…" : "Exportar Excel"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Reportes de {period}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {REPORT_TYPES.map((r) => (
          <DropdownMenuItem
            key={r.value}
            disabled={exporting !== null}
            onSelect={() => void handleExport(r.value, r.label)}
            className="items-start gap-2"
          >
            <FileSpreadsheet className="mt-0.5 size-4 shrink-0" />
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
