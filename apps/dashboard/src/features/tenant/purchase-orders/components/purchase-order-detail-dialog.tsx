"use client";

import { AppDialog, EM_DASH, formatDate, formatDateTime, formatMoney } from "@/features/_shared";
import type { PurchaseOrderRow } from "../lib/purchase-orders.types";

/** Detalle de solo lectura de una orden de compra: cabecera + líneas. */
export function PurchaseOrderDetailDialog({
  order,
  onOpenChangeAction,
}: {
  order: PurchaseOrderRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = order !== null;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={order ? `Orden de compra del ${formatDate(order.order_date)}` : ""}
      description={
        order?.received_at
          ? `Recibida el ${formatDateTime(order.received_at)}.`
          : "Aún pendiente de recibir."
      }
    >
      {order ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Proveedor</p>
              <p className="font-medium">{order.supplier?.name ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sede</p>
              <p className="font-medium">{order.branch?.name ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Registrada por</p>
              <p className="font-medium">
                {order.staff ? `${order.staff.first_name} ${order.staff.last_name}` : EM_DASH}
              </p>
            </div>
          </div>

          <div className="rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 text-right font-medium">Cantidad</th>
                  <th className="p-3 text-right font-medium">Costo unit.</th>
                  <th className="p-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.product?.name ?? EM_DASH}</span>
                        {item.product ? (
                          <span className="text-xs text-muted-foreground">{item.product.sku}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 text-right tabular-nums">{item.quantity}</td>
                    <td className="p-3 text-right tabular-nums">{formatMoney(item.unit_cost)}</td>
                    <td className="p-3 text-right font-medium tabular-nums">
                      {formatMoney(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end text-sm">
            <span className="text-muted-foreground">Total:&nbsp;</span>
            <span className="font-semibold tabular-nums">{formatMoney(order.total)}</span>
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
}
