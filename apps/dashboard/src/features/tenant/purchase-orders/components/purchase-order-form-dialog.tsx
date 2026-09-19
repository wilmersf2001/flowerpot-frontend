"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  TextField,
  formatMoney,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useSupplierOptions } from "@/features/tenant/suppliers";
import { useBranchOptions } from "@/features/tenant/branches";
import { useProductOptions } from "@/features/tenant/products";
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from "../lib/purchase-orders.hooks";
import {
  purchaseOrderFormDefaults,
  purchaseOrderFormFields,
  purchaseOrderFormSchema,
  purchaseOrderItemFormDefault,
  purchaseOrderToForm,
  toCreatePurchaseOrderInput,
  toUpdatePurchaseOrderInput,
  type PurchaseOrderForm,
} from "../lib/purchase-orders.schema";
import type { PurchaseOrderRow } from "../lib/purchase-orders.types";

const FORM_ID = "purchase-order-form";

/**
 * Diálogo de orden de compra. Sin `order` es "Nueva orden" (POST); con
 * `order` es "Editar orden" (PATCH, solo válido si está `pending` — el padre
 * ya se encarga de no ofrecer editar una recibida).
 */
export function PurchaseOrderFormDialog({
  open,
  order = null,
  onOpenChangeAction,
}: {
  open: boolean;
  order?: PurchaseOrderRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = order !== null;
  const createOrder = useCreatePurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder();
  const supplierOptions = useSupplierOptions(open);
  const branchOptions = useBranchOptions(open);
  const productOptions = useProductOptions(open);

  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: purchaseOrderFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "purchase-order");
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  useEffect(() => {
    if (open) reset(order ? purchaseOrderToForm(order) : purchaseOrderFormDefaults);
  }, [open, order, reset]);

  const total = useMemo(
    () =>
      (watchedItems ?? []).reduce((sum, item) => {
        const quantity = Number(item?.quantity);
        const unitCost = Number(item?.unit_cost);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return sum;
        return sum + quantity * unitCost;
      }, 0),
    [watchedItems],
  );

  const supplierSelected: ComboboxOption | null = order?.supplier
    ? { value: order.supplier.id, label: order.supplier.name }
    : null;
  const branchSelected: ComboboxOption | null = order?.branch
    ? { value: order.branch.id, label: order.branch.name }
    : null;

  function itemProductSelected(index: number): ComboboxOption | null {
    const item = order?.items[index];
    return item?.product ? { value: item.product.id, label: item.product.name, hint: item.product.sku } : null;
  }

  const onSubmit = handleSubmit(
    useResourceFormSubmit<PurchaseOrderForm, PurchaseOrderRow>({
      form,
      fields: purchaseOrderFormFields(fields.length),
      submit: (values) =>
        order
          ? updateOrder.mutateAsync({ id: order.id, input: toUpdatePurchaseOrderInput(values) })
          : createOrder.mutateAsync(toCreatePurchaseOrderInput(values)),
      successMessage: () => (isEdit ? "Orden de compra actualizada." : "Orden de compra creada."),
      errorMessage: isEdit
        ? "No se pudo actualizar la orden de compra."
        : "No se pudo crear la orden de compra.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title={isEdit ? "Editar orden de compra" : "Nueva orden de compra"}
      description="La orden nace pendiente: el stock solo sube al recibirla."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Guardando…"
                : "Creando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear orden"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Proveedor"
            htmlFor="purchase-order-supplier"
            error={errors.supplier_id?.message}
          >
            <Controller
              control={control}
              name="supplier_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="purchase-order-supplier"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={supplierOptions}
                  selectedOption={supplierSelected}
                  placeholder="Selecciona un proveedor"
                  searchPlaceholder="Buscar proveedor…"
                  emptyText="Sin proveedores."
                  aria-invalid={errors.supplier_id ? true : undefined}
                />
              )}
            />
          </Field>

          <Field label="Sede" htmlFor="purchase-order-branch" error={errors.branch_id?.message}>
            <Controller
              control={control}
              name="branch_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="purchase-order-branch"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={branchOptions}
                  selectedOption={branchSelected}
                  placeholder="Sede que recibe"
                  searchPlaceholder="Buscar sede…"
                  emptyText="Sin sedes."
                  aria-invalid={errors.branch_id ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <DateField form={form} name="order_date" idPrefix="purchase-order" label="Fecha de la orden" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Productos</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(purchaseOrderItemFormDefault)}
            >
              <Plus className="size-4" />
              Agregar producto
            </Button>
          </div>

          {errors.items?.message ? (
            <p className="text-xs text-destructive">{errors.items.message}</p>
          ) : null}

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => {
              const itemErrors = errors.items?.[index];
              return (
                <div key={field.id} className="grid grid-cols-[1fr_6rem_7rem_2rem] items-start gap-2">
                  <Field
                    label={index === 0 ? "Producto" : ""}
                    htmlFor={`purchase-order-item-${index}-product`}
                    error={itemErrors?.product_id?.message}
                  >
                    <Controller
                      control={control}
                      name={`items.${index}.product_id`}
                      render={({ field: productField }) => (
                        <AsyncCombobox
                          id={`purchase-order-item-${index}-product`}
                          value={productField.value}
                          onValueChange={productField.onChange}
                          source={productOptions}
                          selectedOption={itemProductSelected(index)}
                          placeholder="Producto"
                          searchPlaceholder="Buscar producto…"
                          emptyText="Sin productos."
                          aria-invalid={itemErrors?.product_id ? true : undefined}
                        />
                      )}
                    />
                  </Field>

                  <TextField
                    {...bind(`items.${index}.quantity`)}
                    error={itemErrors?.quantity}
                    label={index === 0 ? "Cantidad" : ""}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step="1"
                  />

                  <TextField
                    {...bind(`items.${index}.unit_cost`)}
                    error={itemErrors?.unit_cost}
                    label={index === 0 ? "Costo unit." : ""}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-auto text-destructive hover:text-destructive"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    aria-label="Quitar producto"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end border-t pt-3 text-sm">
            <span className="text-muted-foreground">Total estimado:&nbsp;</span>
            <span className="font-semibold tabular-nums">{formatMoney(total)}</span>
          </div>
        </div>
      </form>
    </AppDialog>
  );
}
