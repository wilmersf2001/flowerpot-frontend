"use client";

import { AppDialog, EM_DASH, formatDateTime, formatMoney } from "@/features/_shared";
import { SALE_PAYMENT_METHOD_LABELS } from "../lib/sales.constants";
import type { SaleRow } from "../lib/sales.types";

/** Detalle de solo lectura de una venta: cabecera + líneas + motivo de anulación si aplica. */
export function SaleDetailDialog({
  sale,
  onOpenChangeAction,
}: {
  sale: SaleRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = sale !== null;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={sale ? `Venta del ${formatDateTime(sale.created_at)}` : ""}
      description={
        sale?.status === "voided"
          ? `Anulada el ${formatDateTime(sale.voided_at)}. Motivo: ${sale.void_reason ?? EM_DASH}`
          : undefined
      }
    >
      {sale ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{sale.member?.full_name ?? "Visitante"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sede</p>
              <p className="font-medium">{sale.branch?.name ?? EM_DASH}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="font-medium">
                {SALE_PAYMENT_METHOD_LABELS[sale.payment_method]}
                {sale.payment_reference ? ` · ${sale.payment_reference}` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 text-right font-medium">Cantidad</th>
                  <th className="p-3 text-right font-medium">Precio unit.</th>
                  <th className="p-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
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
                    <td className="p-3 text-right tabular-nums">{formatMoney(item.unit_price)}</td>
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
            <span className="font-semibold tabular-nums">{formatMoney(sale.total)}</span>
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
}
