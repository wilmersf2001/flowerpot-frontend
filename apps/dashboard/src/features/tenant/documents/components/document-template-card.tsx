"use client";

import { FileText, Pencil, Eye } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import type { DocumentTemplateSummary } from "../lib/documents.types";

/** Tarjeta del catálogo: documento, formato efectivo y acceso al editor. */
export function DocumentTemplateCard({
  template,
  canEdit,
  onOpenAction,
}: {
  template: DocumentTemplateSummary;
  canEdit: boolean;
  onOpenAction: (template: DocumentTemplateSummary) => void;
}) {
  const effectiveLabel =
    template.available_layouts.find((o) => o.key === template.effective_layout)
      ?.label ?? template.effective_layout;
  const inherits = template.layout === null;

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{template.label}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            Usa: <span className="font-medium text-foreground">{effectiveLabel}</span>
            <Badge tone={inherits ? "neutral" : "primary"} variant="soft">
              {inherits ? "De la empresa" : "Formato propio"}
            </Badge>
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-auto self-start"
        onClick={() => onOpenAction(template)}
      >
        {canEdit ? <Pencil className="size-4" /> : <Eye className="size-4" />}
        {canEdit ? "Editar" : "Ver"}
      </Button>
    </article>
  );
}
