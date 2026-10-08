"use client";

import { useCallback, useState } from "react";
import { FileDown, Files } from "lucide-react";
import { usePdfDownload, type RowAction } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import {
  RECORD_DOCUMENTS,
  type RecordDocumentType,
} from "../lib/documents.constants";
import { GeneratedDocumentsDialog } from "./generated-documents-dialog";

/**
 * Acciones de documento para las filas de un módulo (membresías, pagos…).
 *
 * ```tsx
 * const docs = useRecordDocuments("payment_receipt");
 * <RowActions actions={[..., ...docs.actionsFor(row.id, { subject: nombre })]} />
 * {docs.dialog}
 * ```
 * Devuelve "Descargar …" (PDF al vuelo) y "Documentos emitidos" (historial y
 * emisión de copias). Ambas se omiten si el usuario no tiene el permiso del
 * documento; el backend lo valida igual.
 */
export function useRecordDocuments(type: RecordDocumentType) {
  const config = RECORD_DOCUMENTS[type];
  const hasPermission = useHasPermission();
  const canView = hasPermission(config.viewPermission);
  const pdf = usePdfDownload();
  const [target, setTarget] = useState<{ id: number | string; subject?: string } | null>(
    null,
  );

  const actionsFor = useCallback(
    (
      id: number | string,
      options: {
        /** `false` oculta la descarga (p. ej. caja abierta, orden cancelada). */
        canDownload?: boolean;
        /** Texto para el subtítulo del historial (nombre del socio, etc.). */
        subject?: string;
      } = {},
    ): RowAction[] => {
      if (!canView) return [];
      const { canDownload = true, subject } = options;
      const actions: RowAction[] = [];
      if (canDownload) {
        actions.push({
          label: config.downloadLabel,
          icon: FileDown,
          onSelect: () => pdf.download(config.path(id), config.fileName(id)),
        });
      }
      actions.push({
        label: "Documentos emitidos",
        icon: Files,
        onSelect: () => setTarget({ id, subject }),
      });
      return actions;
    },
    [canView, config, pdf],
  );

  const dialog = (
    <GeneratedDocumentsDialog
      type={type}
      documentableId={target?.id ?? null}
      subject={target?.subject}
      onOpenChangeAction={(open) => {
        if (!open) setTarget(null);
      }}
    />
  );

  return { actionsFor, dialog };
}
