"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import {
  useCreateProductCategory,
  useUpdateProductCategory,
} from "../lib/product-categories.hooks";
import {
  PRODUCT_CATEGORY_FORM_FIELDS,
  productCategoryFormDefaults,
  productCategoryFormSchema,
  productCategoryToForm,
  toCreateProductCategoryInput,
  toUpdateProductCategoryInput,
  type ProductCategoryForm,
} from "../lib/product-categories.schema";
import type { ProductCategoryRow } from "../lib/product-categories.types";

const FORM_ID = "product-category-form";

/**
 * Diálogo de categoría de producto. Sin `category` es "Nueva categoría"
 * (POST); con `category` es "Editar categoría" (PATCH). Controlado por el padre.
 */
export function ProductCategoryFormDialog({
  open,
  category = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Categoría a editar. `null`/ausente => modo alta. */
  category?: ProductCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = category !== null;
  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();

  const form = useForm<ProductCategoryForm>({
    resolver: zodResolver(productCategoryFormSchema),
    defaultValues: productCategoryFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "product-category");

  // Cada vez que se abre, sincroniza con la categoría (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(category ? productCategoryToForm(category) : productCategoryFormDefaults);
  }, [open, category, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<ProductCategoryForm, ProductCategoryRow>({
      form,
      fields: PRODUCT_CATEGORY_FORM_FIELDS,
      submit: (values) =>
        category
          ? updateCategory.mutateAsync({
              id: category.id,
              input: toUpdateProductCategoryInput(values),
            })
          : createCategory.mutateAsync(toCreateProductCategoryInput(values)),
      successMessage: (values) =>
        `Categoría "${values.name}" ${isEdit ? "actualizada" : "creada"}.`,
      errorMessage: isEdit
        ? "No se pudo actualizar la categoría."
        : "No se pudo crear la categoría.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar categoría" : "Nueva categoría"}
      description={
        isEdit
          ? "Actualiza el nombre de la categoría."
          : "Crea una categoría para agrupar productos."
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
                : "Crear categoría"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Bebidas" autoFocus />
      </form>
    </AppDialog>
  );
}
