"use client";

import {
  AppDialog,
  EM_DASH,
  StatusBadge,
  formatDate,
  formatDateTime,
  formatMoney,
  type StatusMap,
} from "@/features/_shared";
import { useEquipmentDetail } from "../lib/equipment.hooks";

const STATUS_MAP: StatusMap = {
  operativo: { label: "Operativo", tone: "success" },
  en_mantenimiento: { label: "En mantenimiento", tone: "warning" },
  fuera_de_servicio: { label: "Fuera de servicio", tone: "neutral" },
  dado_de_baja: { label: "Dado de baja", tone: "danger" },
};

const MAINTENANCE_STATUS_MAP: StatusMap = {
  programado: { label: "Programado", tone: "warning" },
  en_progreso: { label: "En progreso", tone: "info" },
  completado: { label: "Completado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

const MAINTENANCE_TYPE_MAP: StatusMap = {
  preventivo: { label: "Preventivo", tone: "info" },
  correctivo: { label: "Correctivo", tone: "warning" },
};

/** Detalle de solo lectura de un equipo: datos + historial de mantenimientos. */
export function EquipmentDetailDialog({
  equipmentId,
  onOpenChangeAction,
}: {
  equipmentId: string | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = equipmentId !== null;
  const detail = useEquipmentDetail(equipmentId);
  const equipment = detail.data;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={equipment ? equipment.name : "Equipo"}
      description={
        equipment
          ? [equipment.brand, equipment.model].filter(Boolean).join(" · ") ||
            equipment.serial_number ||
            "Sin marca ni modelo registrados."
          : undefined
      }
    >
      {detail.isPending ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : equipment ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Categoría</p>
              <p className="font-medium">{equipment.category?.name ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sede</p>
              <p className="font-medium">{equipment.branch?.name ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <StatusBadge value={equipment.status} map={STATUS_MAP} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número de serie</p>
              <p className="font-medium">{equipment.serial_number ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de compra</p>
              <p className="font-medium">
                {equipment.purchase_date ? formatDate(equipment.purchase_date) : EM_DASH}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Costo de compra</p>
              <p className="font-medium">{formatMoney(equipment.purchase_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencimiento de garantía</p>
              <p className="font-medium">
                {equipment.warranty_expiration ? formatDate(equipment.warranty_expiration) : EM_DASH}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Historial de mantenimientos</p>
            {equipment.maintenances.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este equipo aún no tiene mantenimientos.</p>
            ) : (
              <div className="rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="p-3 font-medium">Tipo</th>
                      <th className="p-3 font-medium">Proveedor</th>
                      <th className="p-3 font-medium">Fecha</th>
                      <th className="p-3 font-medium">Estado</th>
                      <th className="p-3 text-right font-medium">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.maintenances.map((maintenance) => (
                      <tr key={maintenance.id} className="border-b last:border-0">
                        <td className="p-3">
                          <StatusBadge value={maintenance.type} map={MAINTENANCE_TYPE_MAP} />
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {maintenance.supplier?.name ?? EM_DASH}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {maintenance.completed_at
                            ? formatDateTime(maintenance.completed_at)
                            : maintenance.started_at
                              ? formatDateTime(maintenance.started_at)
                              : maintenance.scheduled_date
                                ? formatDate(maintenance.scheduled_date)
                                : EM_DASH}
                        </td>
                        <td className="p-3">
                          <StatusBadge value={maintenance.status} map={MAINTENANCE_STATUS_MAP} />
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatMoney(maintenance.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-destructive">No se pudo cargar el equipo.</p>
      )}
    </AppDialog>
  );
}
