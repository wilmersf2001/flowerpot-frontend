"use client";

import { Button } from "@repo/ui/button";
import { AppDialog, CopyRow } from "@/features/_shared";
import type { PlanRow } from "../lib/plans.types";

/**
 * Resumen que se muestra justo después de crear un plan: confirma los datos
 * clave y deja copiar el identificador para usarlo al asignar el plan.
 */
export function PlanCredentialsDialog({
  result,
  onCloseAction,
}: {
  result: PlanRow | null;
  onCloseAction: () => void;
}) {
  return (
    <AppDialog
      open={result !== null}
      onOpenChange={(open) => {
        if (!open) onCloseAction();
      }}
      title="Plan creado"
      description="Ya está disponible para asignarlo a los gimnasios."
      footer={
        <Button type="button" onClick={onCloseAction}>
          Entendido
        </Button>
      }
    >
      {result ? (
        <div className="flex flex-col gap-3">
          <CopyRow label="Identificador" value={result.id} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Plan
            </span>
            <span className="text-sm">{result.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Precio
            </span>
            <span className="text-sm">{result.price_formatted}</span>
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
}
