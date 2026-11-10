"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { AppDialog } from "@/features/_shared";
import type { MemberRow } from "../lib/members.types";

/**
 * QR del socio para el check-in en recepción. Se dibuja en el navegador a
 * partir de `qr_code` (no hace falta guardar imágenes) y se puede descargar
 * como PNG para enviarlo por WhatsApp o imprimirlo.
 */
export function MemberQrDialog({
  member,
  onOpenChangeAction,
}: {
  member: MemberRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = member !== null;
  const qrCode = member?.qr_code ?? "";
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode) return;
    let cancelled = false;
    QRCode.toDataURL(qrCode, { width: 320, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [qrCode]);

  function handleDownload() {
    if (!dataUrl || !member) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${member.dni}.png`;
    link.click();
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-sm"
      title="Código QR del socio"
      description={member ? `${member.full_name} · DNI ${member.dni}` : undefined}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChangeAction(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={handleDownload} disabled={!dataUrl}>
            <Download className="size-4" />
            Descargar PNG
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3">
        {qrCode && dataUrl ? (
          // Fondo blanco fijo: un QR sobre fondo oscuro no lo leen todos los lectores.
          // `<img>` y no next/image: es una data URL generada aquí, no hay nada que optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`Código QR de ${member?.full_name ?? "socio"}`}
            className="size-64 rounded-md bg-white p-2"
          />
        ) : (
          <div className="grid size-64 place-items-center rounded-md border text-sm text-muted-foreground">
            {qrCode ? "Generando…" : "Este socio no tiene código QR."}
          </div>
        )}
        {qrCode ? (
          <code className="text-xs text-muted-foreground">{qrCode}</code>
        ) : null}
        <p className="text-center text-xs text-muted-foreground">
          Muéstralo en el lector de recepción para registrar la entrada. Si lo
          olvida, también puede entrar con su DNI.
        </p>
      </div>
    </AppDialog>
  );
}
