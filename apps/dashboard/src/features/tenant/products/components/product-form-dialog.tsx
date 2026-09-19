"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  Field,
  TextareaField,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useProductCategoryOptions } from "@/features/tenant/product-categories";
import { useCreateProduct, useUpdateProduct } from "../lib/products.hooks";
import {
  PRODUCT_FORM_FIELDS,
  productFormDefaults,
  productFormSchema,
  productToForm,
  toCreateProductInput,
  toUpdateProductInput,
  type ProductForm,
} from "../lib/products.schema";
import type { ProductRow } from "../lib/products.types";

const FORM_ID = "product-form";

const NO_CATEGORY_OPTION: ComboboxOption = { value: "", label: "Sin categoría" };

/**
 * Diálogo de producto. Sin `product` es "Nuevo producto" (POST); con
 * `product` es "Editar producto" (PATCH). Controlado por el padre.
 */
export function ProductFormDialog({
  open,
  product = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Producto a editar. `null`/ausente => modo alta. */
  product?: ProductRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = product !== null;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const categoryOptions = useProductCategoryOptions(open);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "product");

  // Cada vez que se abre, sincroniza con el producto (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(product ? productToForm(product) : productFormDefaults);
  }, [open, product, reset]);

  const categorySelectOptions: ComboboxOption[] = useMemo(
    () => [NO_CATEGORY_OPTION, ...categoryOptions.options],
    [categoryOptions.options],
  );

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ProductForm, ProductRow>({
      form,
      fields: PRODUCT_FORM_FIELDS,
      submit: (values) =>
        product
          ? updateProduct.mutateAsync({ id: product.id, input: toUpdateProductInput(values) })
          : createProduct.mutateAsync(toCreateProductInput(values)),
      successMessage: (values) => `Producto "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit ? "No se pudo actualizar el producto." : "No se pudo crear el producto.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar producto" : "Nuevo producto"}
      description={
        isEdit
          ? "Actualiza los datos del producto. El stock no se edita aquí."
          : "Crea un producto del catálogo. Empieza sin stock en ninguna sede."
      }
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
                : "Crear producto"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Proteína Whey 1kg" autoFocus />

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("sku")} label="SKU" placeholder="WHEY-1KG-VAN" />

          <Field
            label="Categoría"
            htmlFor="product-category"
            hint="Opcional."
            error={errors.product_category_id?.message}
          >
            <Controller
              control={control}
              name="product_category_id"
              render={({ field }) => (
                <Combobox
                  id="product-category"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={categorySelectOptions}
                  searchable
                  placeholder="Selecciona una categoría"
                  searchPlaceholder="Buscar categoría…"
                  emptyText="Sin categorías."
                  aria-invalid={errors.product_category_id ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <TextareaField
          {...bind("description")}
          label="Descripción"
          hint="Opcional."
          placeholder="Sabor vainilla…"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("sale_price")}
            label="Precio de venta"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="149.90"
          />
          <TextField
            {...bind("cost")}
            label="Costo"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="110.00"
            hint="Opcional. Se pisa al recibir una orden de compra."
          />
        </div>
      </form>
    </AppDialog>
  );
}
