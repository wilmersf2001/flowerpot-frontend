"use client";

import { Button } from "@repo/ui/button";
import { AppDialog, CopyRow } from "@/features/_shared";
import type { CreateTenantResult } from "../lib/tenants.types";

/**
 * Se muestra UNA sola vez, justo después de crear el gimnasio: son las
 * credenciales del administrador inicial que genera el backend.
 */
export function TenantCredentialsDialog({
  result,
  onCloseAction,
}: {
  result: CreateTenantResult | null;
  onCloseAction: () => void;
}) {
  return (
    <AppDialog
      open={result !== null}
      onOpenChange={(open) => {
        if (!open) onCloseAction();
      }}
      title="Gimnasio creado"
      description="Guarda estas credenciales ahora: la contraseña no se vuelve a mostrar."
      footer={
        <Button type="button" onClick={onCloseAction}>
          Ya la guardé
        </Button>
      }
    >
      {result ? (
        <div className="flex flex-col gap-3">
          <CopyRow label="Identificador" value={result.tenant.id} />
          <CopyRow label="Correo del admin" value={result.admin_email} />
          <CopyRow label="Contraseña" value={result.admin_password} />
        </div>
      ) : null}
    </AppDialog>
  );
}
