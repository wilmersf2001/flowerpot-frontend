import { z } from "zod";
import type { Path } from "react-hook-form";
import { numericText, requiredText } from "@/features/_shared/form-schema";
import type {
  CreatePurchaseOrderInput,
  PurchaseOrderRow,
  UpdatePurchaseOrderInput,
} from "./purchase-orders.types";

const purchaseOrderItemSchema = z.object({
  product_id: requiredText("El producto"),
  quantity: numericText("La cantidad", { min: 1 }),
  unit_cost: numericText("El costo unitario", { min: 0 }),
});

export type PurchaseOrderItemForm = z.infer<typeof purchaseOrderItemSchema>;

export const purchaseOrderFormSchema = z.object({
  supplier_id: requiredText("El proveedor"),
  branch_id: requiredText("La sede"),
  order_date: requiredText("La fecha de la orden", "f"),
  items: z.array(purchaseOrderItemSchema).min(1, "Debes agregar al menos un producto."),
});

export type PurchaseOrderForm = z.infer<typeof purchaseOrderFormSchema>;

export const purchaseOrderItemFormDefault: PurchaseOrderItemForm = {
  product_id: "",
  quantity: "1",
  unit_cost: "",
};

export const purchaseOrderFormDefaults: PurchaseOrderForm = {
  supplier_id: "",
  branch_id: "",
  order_date: "",
  items: [purchaseOrderItemFormDefault],
};

/**
 * Los errores 422 de línea llegan con clave `items.0.quantity`, `items.1.unit_cost`,
 * etc. — depende de cuántas líneas tenga el formulario en ese momento, así que
 * la lista de campos conocidos se arma según la cantidad actual de líneas.
 */
export function purchaseOrderFormFields(itemCount: number): Path<PurchaseOrderForm>[] {
  const itemFields = Array.from({ length: itemCount }, (_, i) => [
    `items.${i}.product_id` as const,
    `items.${i}.quantity` as const,
    `items.${i}.unit_cost` as const,
  ]).flat();
  return ["supplier_id", "branch_id", "order_date", ...itemFields];
}

/** Prellena el formulario con los datos de una orden existente (modo edición). */
export function purchaseOrderToForm(order: PurchaseOrderRow): PurchaseOrderForm {
  return {
    supplier_id: order.supplier_id,
    branch_id: order.branch_id,
    order_date: order.order_date,
    items: order.items.length
      ? order.items.map((item) => ({
          product_id: item.product_id,
          quantity: String(item.quantity),
          unit_cost: String(item.unit_cost),
        }))
      : [purchaseOrderItemFormDefault],
  };
}

/** Convierte el formulario validado al cuerpo de `POST /purchase-orders`. */
export function toCreatePurchaseOrderInput(form: PurchaseOrderForm): CreatePurchaseOrderInput {
  return {
    supplier_id: Number(form.supplier_id),
    branch_id: Number(form.branch_id),
    order_date: form.order_date,
    items: form.items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_cost: Number(item.unit_cost),
    })),
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /purchase-orders/{id}`. */
export function toUpdatePurchaseOrderInput(form: PurchaseOrderForm): UpdatePurchaseOrderInput {
  return toCreatePurchaseOrderInput(form);
}
