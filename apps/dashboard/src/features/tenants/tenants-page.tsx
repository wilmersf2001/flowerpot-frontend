"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader } from "@/features/_shared";
import { useTenants } from "./lib/tenants.hooks";
import type { CreateTenantResult, TenantRow } from "./lib/tenants.types";
import { TenantsTable } from "./components/tenants-table";
import { TenantFormDialog } from "./components/tenant-form-dialog";
import { TenantCredentialsDialog } from "./components/tenant-credentials-dialog";
import { DeleteTenantDialog } from "./components/delete-tenant-dialog";

/** Pantalla de gimnasios: lista + alta + baja. Punto de entrada del módulo. */
export function TenantsPage() {
  const tenants = useTenants();

  const [formOpen, setFormOpen] = useState(false);
  const [credentials, setCredentials] = useState<CreateTenantResult | null>(null);
  const [toDelete, setToDelete] = useState<TenantRow | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Gimnasios"
        description="Alta, baja y estado de cada gimnasio (tenant) del SaaS."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo gimnasio
          </Button>
        }
      />

      {tenants.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de gimnasios.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => tenants.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <TenantsTable
          rows={tenants.data ?? []}
          isLoading={tenants.isPending}
          onDelete={setToDelete}
        />
      )}

      <TenantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={setCredentials}
      />
      <TenantCredentialsDialog
        result={credentials}
        onClose={() => setCredentials(null)}
      />
      <DeleteTenantDialog
        tenant={toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}
