"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import type { CreateTenantResult } from "../lib/tenants.types";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // El navegador puede bloquear el portapapeles; el valor está a la vista.
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border bg-muted px-2 py-1.5 text-sm">
          {value}
        </code>
        <Button type="button" variant="outline" size="icon" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          <span className="sr-only">Copiar {label}</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Se muestra UNA sola vez, justo después de crear el gimnasio: son las
 * credenciales del administrador inicial que genera el backend.
 */
export function TenantCredentialsDialog({
  result,
  onClose,
}: {
  result: CreateTenantResult | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={result !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gimnasio creado</DialogTitle>
          <DialogDescription>
            Guarda estas credenciales ahora: la contraseña no se vuelve a
            mostrar.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3">
            <CopyRow label="Identificador" value={result.tenant.id} />
            <CopyRow label="Correo del admin" value={result.admin_email} />
            <CopyRow label="Contraseña" value={result.admin_password} />
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Ya la guardé
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
