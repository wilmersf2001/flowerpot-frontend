"use client";

import { useState } from "react";
import { ResourceHeader } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { DocumentTemplateCard } from "./components/document-template-card";
import { TemplateEditorDialog } from "./components/template-editor-dialog";
import { DOCUMENTS_EDIT_PERMISSION } from "./lib/documents.constants";
import { useDocumentTemplates } from "./lib/documents.hooks";
import type { DocumentTemplateSummary } from "./lib/documents.types";

export function DocumentTemplatesPage() {
  const templates = useDocumentTemplates();
  const hasPermission = useHasPermission();
  const canEdit = hasPermission(DOCUMENTS_EDIT_PERMISSION);
  const [editing, setEditing] = useState<DocumentTemplateSummary | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Documentos y plantillas"
        description="Título, texto y formato de cada documento PDF que emite el sistema: contratos, recibos, órdenes y reportes."
      />

      {templates.isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-busy="true"
        >
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div
              key={key}
              className="h-32 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>
      ) : templates.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el catálogo de documentos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => templates.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : templates.data.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay documentos configurables.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.data.map((template) => (
            <DocumentTemplateCard
              key={template.type}
              template={template}
              canEdit={canEdit}
              onOpenAction={setEditing}
            />
          ))}
        </div>
      )}

      <TemplateEditorDialog
        type={editing?.type ?? null}
        label={editing?.label ?? ""}
        canEdit={canEdit}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
