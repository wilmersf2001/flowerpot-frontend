"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { AppDialog, AsyncCombobox, Field, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import { useMemberOptions } from "@/features/tenant/members";
import { useProductOptions } from "@/features/tenant/products";
import { SALE_PAYMENT_METHOD_LABELS, SALE_PAYMENT_METHODS } from "../lib/sales.constants";
import { useCreateSale } from "../lib/sales.hooks";
import {
  saleFormDefaults,
  saleFormFields,
  saleFormSchema,
  saleItemFormDefault,
  toCreateSaleInput,
  type SaleForm,
} from "../lib/sales.schema";
import type { SaleRow } from "../lib/sales.types";

const FORM_ID = "sale-form";

const VISITOR_OPTION: ComboboxOption = { value: "", label: "Visitante (sin socio)" };

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = SALE_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: SALE_PAYMENT_METHOD_LABELS[method],
}));

/** Diálogo de nueva venta (`POST /sales`). No hay edición: solo alta o anulación. */
export function SaleFormDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const createSale = useCreateSale();
  const memberOptions = useMemberOptions(open);
  const productOptions = useProductOptions(open);

  const form = useForm<SaleForm>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: saleFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "sale");
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) reset(saleFormDefaults);
  }, [open, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<SaleForm, SaleRow>({
      form,
      fields: saleFormFields(fields.length),
      submit: (values) => createSale.mutateAsync(toCreateSaleInput(values)),
      successMessage: (values) => `Venta registrada${values.member_id ? "" : " (visitante)"}.`,
      errorMessage: "No se pudo registrar la venta.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-2xl"
      title="Nueva venta"
      description="Descuenta el stock de la sede activa al instante y registra el ingreso en la caja abierta."
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
            {isSubmitting ? "Registrando…" : "Registrar venta"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Socio" htmlFor="sale-member" hint="Opcional. Déjalo vacío para un visitante.">
            <Controller
              control={control}
              name="member_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="sale-member"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={memberOptions}
                  selectedOption={VISITOR_OPTION}
                  placeholder="Visitante (sin socio)"
                  searchPlaceholder="Buscar socio…"
                  emptyText="Sin socios."
                />
              )}
            />
          </Field>

          <Field
            label="Método de pago"
            htmlFor="sale-payment-method"
            error={errors.payment_method?.message}
          >
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Combobox
                  id="sale-payment-method"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PAYMENT_METHOD_OPTIONS}
                  aria-invalid={errors.payment_method ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <TextField
          {...bind("payment_reference")}
          label="Referencia de pago"
          hint="Opcional. N.º de operación de Yape/Plin/transferencia."
          placeholder="OP-889912"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Productos</span>
            <Button type="button" variant="outline" size="sm" onClick={() => append(saleItemFormDefault)}>
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
                <div key={field.id} className="grid grid-cols-[1fr_7rem_2rem] items-start gap-2">
                  <Field
                    label={index === 0 ? "Producto" : ""}
                    htmlFor={`sale-item-${index}-product`}
                    error={itemErrors?.product_id?.message}
                  >
                    <Controller
                      control={control}
                      name={`items.${index}.product_id`}
                      render={({ field: productField }) => (
                        <AsyncCombobox
                          id={`sale-item-${index}-product`}
                          value={productField.value}
                          onValueChange={productField.onChange}
                          source={productOptions}
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
        </div>
      </form>
    </AppDialog>
  );
}
