"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { AppDialog, TextField, useFieldBinder, useResourceFormSubmit } from "@/features/_shared";
import {
  useCreateEquipmentCategory,
  useUpdateEquipmentCategory,
} from "../lib/equipment-categories.hooks";
import {
  EQUIPMENT_CATEGORY_FORM_FIELDS,
  equipmentCategoryFormDefaults,
  equipmentCategoryFormSchema,
  equipmentCategoryToForm,
  toCreateEquipmentCategoryInput,
  toUpdateEquipmentCategoryInput,
  type EquipmentCategoryForm,
} from "../lib/equipment-categories.schema";
import type { EquipmentCategoryRow } from "../lib/equipment-categories.types";

const FORM_ID = "equipment-category-form";

/**
 * Diálogo de categoría de equipo. Sin `category` es "Nueva categoría"
 * (POST); con `category` es "Editar categoría" (PATCH). Controlado por el padre.
 */
export function EquipmentCategoryFormDialog({
  open,
  category = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Categoría a editar. `null`/ausente => modo alta. */
  category?: EquipmentCategoryRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = category !== null;
  const createCategory = useCreateEquipmentCategory();
  const updateCategory = useUpdateEquipmentCategory();

  const form = useForm<EquipmentCategoryForm>({
    resolver: zodResolver(equipmentCategoryFormSchema),
    defaultValues: equipmentCategoryFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "equipment-category");

  // Cada vez que se abre, sincroniza con la categoría (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(category ? equipmentCategoryToForm(category) : equipmentCategoryFormDefaults);
  }, [open, category, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<EquipmentCategoryForm, EquipmentCategoryRow>({
      form,
      fields: EQUIPMENT_CATEGORY_FORM_FIELDS,
      submit: (values) =>
        category
          ? updateCategory.mutateAsync({
              id: category.id,
              input: toUpdateEquipmentCategoryInput(values),
            })
          : createCategory.mutateAsync(toCreateEquipmentCategoryInput(values)),
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
          : "Crea una categoría para agrupar equipos."
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
        <TextField {...bind("name")} label="Nombre" placeholder="Cardio" autoFocus />
      </form>
    </AppDialog>
  );
}
