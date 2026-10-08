"use client";

import { Button } from "@repo/ui/button";
import { AppDialog } from "@/features/_shared";

/**
 * Muestra el PDF de vista previa en un `iframe`. Recibe la URL del objeto ya
 * creada; quien la crea (el formulario) también la libera al cerrar.
 */
export function DocumentPreviewDialog({
  url,
  layoutLabel,
  onOpenChangeAction,
}: {
  /** URL del PDF (blob). `null` => diálogo cerrado. */
  url: string | null;
  layoutLabel?: string;
  onOpenChangeAction: (open: boolean) => void;
}) {
  return (
    <AppDialog
      open={url !== null}
      onOpenChange={onOpenChangeAction}
      className="max-w-4xl"
      title="Vista previa de documento"
      description={
        layoutLabel
          ? `Formato ${layoutLabel}. Usa la marca guardada; los cambios sin guardar no se reflejan.`
          : "Usa la marca guardada; los cambios sin guardar no se reflejan."
      }
      footer={
        <>
          {url ? (
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                Abrir en otra pestaña
              </a>
            </Button>
          ) : null}
          <Button type="button" onClick={() => onOpenChangeAction(false)}>
            Cerrar
          </Button>
        </>
      }
    >
      {url ? (
        <iframe
          src={url}
          title="Vista previa del documento"
          className="h-[70dvh] w-full rounded-md border bg-muted"
        />
      ) : null}
    </AppDialog>
  );
}
