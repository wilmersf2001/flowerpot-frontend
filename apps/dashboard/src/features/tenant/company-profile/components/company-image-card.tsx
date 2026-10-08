"use client";

import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/features/_shared";
import {
  COMPANY_IMAGE_META,
  IMAGE_ACCEPT,
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
} from "../lib/company-profile.constants";
import {
  useDeleteCompanyImage,
  useUploadCompanyImage,
} from "../lib/company-profile.hooks";
import type { CompanyImageType } from "../lib/company-profile.types";

/**
 * Tarjeta de una imagen de marca (logo, firma, sello…). Sube y elimina por su
 * cuenta, sin pasar por el formulario de datos: el backend tiene un endpoint
 * propio por imagen.
 */
export function CompanyImageCard({
  type,
  src,
  canEdit,
}: {
  type: CompanyImageType;
  /** Data URI actual, o `null` si no hay imagen. */
  src: string | null;
  canEdit: boolean;
}) {
  const meta = COMPANY_IMAGE_META[type];
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const upload = useUploadCompanyImage();
  const remove = useDeleteCompanyImage();

  async function onFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo archivo después.
    event.target.value = "";
    if (!file) return;

    if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("La imagen debe ser PNG o JPG.");
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      toast.error("La imagen no debe superar 1 MB.");
      return;
    }

    try {
      await upload.mutateAsync({ type, file });
      toast.success(`${meta.label} actualizado.`);
    } catch (err) {
      const fieldError = err instanceof ApiError ? err.errors?.image?.[0] : null;
      toast.error(
        fieldError ??
          (err instanceof ApiError ? err.message : "No se pudo subir la imagen."),
      );
    }
  }

  async function onConfirmDelete() {
    try {
      await remove.mutateAsync(type);
      toast.success(`${meta.label} eliminado.`);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar la imagen.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div>
        <h3 className="text-sm font-medium">{meta.label}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.hint}</p>
      </div>

      {/* Fondo ajedrezado: deja ver la transparencia de los PNG. */}
      <div
        className="flex h-32 items-center justify-center overflow-hidden rounded-md border bg-muted/40 bg-[length:16px_16px] bg-[image:repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)]"
      >
        {src ? (
          // Data URI servida por el backend: next/image no aporta nada aquí.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={meta.label}
            className="max-h-full max-w-full object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="size-6" aria-hidden />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {canEdit ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label={`Subir ${meta.label}`}
            onChange={onFileChosen}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
          >
            <Upload className="size-4" />
            {upload.isPending ? "Subiendo…" : src ? "Reemplazar" : "Subir"}
          </Button>
          {src ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={upload.isPending}
            >
              <Trash2 className="size-4" />
              Quitar
            </Button>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Quitar ${meta.label.toLowerCase()}`}
        description="Los nuevos documentos se emitirán sin esta imagen."
        confirmLabel="Quitar"
        destructive
        loading={remove.isPending}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
