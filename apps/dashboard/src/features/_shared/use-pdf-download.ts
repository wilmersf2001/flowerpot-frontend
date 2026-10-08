"use client";

import { useCallback, useState } from "react";
import { toast } from "@repo/ui/toast";
import { fetchPdf, pdfErrorMessage, saveBlob } from "./pdf";

/**
 * Descarga un PDF con aviso de progreso y errores en toast.
 *
 * ```tsx
 * const pdf = usePdfDownload();
 * pdf.download(`/payments/${row.id}/receipt`, `recibo-pago-${row.id}.pdf`);
 * ```
 * El nombre del archivo lo manda el backend; `fallbackName` solo se usa si no
 * llega la cabecera `Content-Disposition`.
 */
export function usePdfDownload() {
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const download = useCallback(
    async (path: string, fallbackName: string) => {
      // Los PDF se generan al vuelo (1–2 s): evita dobles clics sobre el mismo.
      if (pendingPath === path) return;
      setPendingPath(path);
      const toastId = toast.loading("Generando PDF…");
      try {
        const { blob, filename } = await fetchPdf(path);
        saveBlob(blob, filename ?? fallbackName);
        toast.success("PDF descargado.", { id: toastId });
      } catch (err) {
        toast.error(await pdfErrorMessage(err, "No se pudo generar el PDF."), {
          id: toastId,
        });
      } finally {
        setPendingPath(null);
      }
    },
    [pendingPath],
  );

  return { download, isPending: pendingPath !== null, pendingPath };
}
