"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/button";

/**
 * Fila "etiqueta + valor" con botón de copiar. Se usa para mostrar datos que
 * el usuario necesita guardar (identificadores, credenciales recién creadas).
 */
export function CopyRow({ label, value }: { label: string; value: string }) {
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
