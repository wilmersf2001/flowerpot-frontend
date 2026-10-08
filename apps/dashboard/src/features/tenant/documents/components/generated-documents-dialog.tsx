"use client";

import { FileDown, FilePlus2 } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import {
  AppDialog,
  formatDateTime,
  usePdfDownload,
} from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { generatedDownloadPath } from "../lib/documents.api";
import { RECORD_DOCUMENTS, type RecordDocumentType } from "../lib/documents.constants";
import {
  useGeneratedDocuments,
  useIssueDocument,
} from "../lib/documents.hooks";
import type { GeneratedDocument } from "../lib/documents.types";

/** 48213 -> "47,1 KB". */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1).replace(".", ",")} KB`;
  return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Historial de copias emitidas de un registro (membresía, pago, venta…).
 * Permite emitir una copia nueva (queda guardada, con huella SHA-256) y
 * volver a descargar exactamente lo que se emitió.
 */
export function GeneratedDocumentsDialog({
  type,
  documentableId,
  subject,
  onOpenChangeAction,
}: {
  type: RecordDocumentType;
  /** Id del registro. `null` => diálogo cerrado. */
  documentableId: number | string | null;
  /** A quién/qué corresponde, para el subtítulo (p. ej. nombre del socio). */
  subject?: string;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const config = RECORD_DOCUMENTS[type];
  const hasPermission = useHasPermission();
  const canIssue = hasPermission(config.generatePermission);

  const documents = useGeneratedDocuments(type, documentableId);
  const issue = useIssueDocument();
  const pdf = usePdfDownload();

  async function onIssue() {
    if (documentableId === null) return;
    try {
      await issue.mutateAsync({ type, documentableId });
      toast.success(`${config.label} emitido y guardado.`);
    } catch (err) {
      // Reglas de negocio (pago fallido, caja abierta…) llegan en `documentable_id`.
      const message =
        err instanceof ApiError
          ? (err.errors?.documentable_id?.[0] ?? err.message)
          : `No se pudo emitir el ${config.label.toLowerCase()}.`;
      toast.error(message);
    }
  }

  const rows = documents.data ?? [];

  return (
    <AppDialog
      open={documentableId !== null}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={`${config.label}: documentos emitidos`}
      description={
        subject
          ? `Copias guardadas de ${subject}. Cada emisión crea una copia nueva e inmutable.`
          : "Cada emisión crea una copia nueva e inmutable."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
          >
            Cerrar
          </Button>
          {canIssue ? (
            <Button type="button" onClick={onIssue} disabled={issue.isPending}>
              <FilePlus2 className="size-4" />
              {issue.isPending ? "Emitiendo…" : "Emitir y guardar"}
            </Button>
          ) : null}
        </>
      }
    >
      {documents.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1].map((key) => (
            <div key={key} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : documents.isError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          No se pudo cargar el historial.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => documents.refetch()}
          >
            Reintentar
          </button>
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Aún no se emitió ninguna copia.
          {canIssue ? " Usa «Emitir y guardar» para crear la primera." : ""}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((doc) => (
            <GeneratedDocumentRow
              key={doc.id}
              doc={doc}
              disabled={pdf.isPending}
              onDownload={() =>
                pdf.download(
                  generatedDownloadPath(doc.id),
                  `${config.fileName(doc.documentable_id).replace(/\.pdf$/, "")}-copia-${doc.id}.pdf`,
                )
              }
            />
          ))}
        </ul>
      )}
    </AppDialog>
  );
}

function GeneratedDocumentRow({
  doc,
  disabled,
  onDownload,
}: {
  doc: GeneratedDocument;
  disabled: boolean;
  onDownload: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{doc.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTime(doc.created_at)}
          {doc.generated_by ? ` · ${doc.generated_by.name}` : ""}
          {` · Formato ${doc.layout} · ${formatSize(doc.size)}`}
        </p>
        <p
          className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/70"
          title={`SHA-256: ${doc.checksum}`}
        >
          SHA-256 {doc.checksum.slice(0, 16)}…
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDownload}
        disabled={disabled}
      >
        <FileDown className="size-4" />
        Descargar
      </Button>
    </li>
  );
}
