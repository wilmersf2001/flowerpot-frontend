"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { AppDialog } from "@/features/_shared";
import { useDevices } from "../lib/devices.hooks";
import type { DeviceRow } from "../lib/devices.types";
import { DevicesTable } from "./devices-table";
import { DeviceFormDialog } from "./device-form-dialog";
import { DeleteDeviceDialog } from "./delete-device-dialog";

/** Lectores de un gimnasio, desde la lista de gimnasios. `tenantId` null = cerrado. */
export function TenantDevicesDialog({
  tenantId,
  onCloseAction,
}: {
  tenantId: string | null;
  onCloseAction: () => void;
}) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DeviceRow | "new" | null>(null);
  const [toDelete, setToDelete] = useState<DeviceRow | null>(null);

  const devices = useDevices(
    { tenant_id: tenantId ?? undefined, page },
    tenantId !== null,
  );
  const meta = devices.data;

  return (
    <>
      <AppDialog
        open={tenantId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPage(1);
            onCloseAction();
          }
        }}
        className="max-w-4xl"
        title={`Lectores de "${tenantId ?? ""}"`}
        description="Lectores biométricos asignados a este gimnasio."
        footer={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Asignar lector
          </Button>
        }
      >
        {devices.isError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            No se pudo cargar los lectores.{" "}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => devices.refetch()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <DevicesTable
            rows={meta?.data ?? []}
            isLoading={devices.isPending}
            hideTenant
            onEditAction={setEditing}
            onDeleteAction={setToDelete}
            emptyMessage="Este gimnasio aún no tiene lectores."
            pagination={{
              page: meta?.current_page ?? page,
              lastPage: meta?.last_page ?? 1,
              total: meta?.total ?? 0,
              from: meta?.from ?? null,
              to: meta?.to ?? null,
              onPageChangeAction: setPage,
              isFetching: devices.isFetching,
            }}
          />
        )}
      </AppDialog>

      <DeviceFormDialog
        open={editing !== null}
        device={editing === "new" ? null : editing}
        defaultTenantId={tenantId ?? ""}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <DeleteDeviceDialog
        device={toDelete}
        onOpenChangeAction={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </>
  );
}
