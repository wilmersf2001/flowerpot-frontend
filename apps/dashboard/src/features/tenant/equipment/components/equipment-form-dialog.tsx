"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useBranchOptions } from "@/features/tenant/branches";
import { useEquipmentCategoryOptions } from "@/features/tenant/equipment-categories";
import { useCreateEquipment, useUpdateEquipment } from "../lib/equipment.hooks";
import {
  EQUIPMENT_FORM_FIELDS,
  equipmentFormDefaults,
  equipmentFormSchema,
  equipmentToForm,
  toCreateEquipmentInput,
  toUpdateEquipmentInput,
  type EquipmentForm,
} from "../lib/equipment.schema";
import type { EquipmentRow } from "../lib/equipment.types";

const FORM_ID = "equipment-form";

const NO_CATEGORY_OPTION: ComboboxOption = { value: "", label: "Sin categoría" };

/**
 * Diálogo de equipo. Sin `equipment` es "Nuevo equipo" (POST); con
 * `equipment` es "Editar equipo" (PATCH). Controlado por el padre. El estado
 * (`status`) no se edita aquí: nace `operativo` y lo mueve el flujo de
 * mantenimientos o el endpoint de dar de baja.
 */
export function EquipmentFormDialog({
  open,
  equipment = null,
  onOpenChangeAction,
}: {
  open: boolean;
  /** Equipo a editar. `null`/ausente => modo alta. */
  equipment?: EquipmentRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = equipment !== null;
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const categoryOptions = useEquipmentCategoryOptions(open);
  const branchOptions = useBranchOptions(open);

  const form = useForm<EquipmentForm>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: equipmentFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "equipment");

  // Cada vez que se abre, sincroniza con el equipo (edición) o limpia (alta).
  useEffect(() => {
    if (open) reset(equipment ? equipmentToForm(equipment) : equipmentFormDefaults);
  }, [open, equipment, reset]);

  const categorySelectOptions: ComboboxOption[] = useMemo(
    () => [NO_CATEGORY_OPTION, ...categoryOptions.options],
    [categoryOptions.options],
  );

  const branchSelected: ComboboxOption | null = equipment?.branch
    ? { value: equipment.branch.id, label: equipment.branch.name }
    : null;

  const onSubmit = handleSubmit(
    useResourceFormSubmit<EquipmentForm, EquipmentRow>({
      form,
      fields: EQUIPMENT_FORM_FIELDS,
      submit: (values) =>
        equipment
          ? updateEquipment.mutateAsync({ id: equipment.id, input: toUpdateEquipmentInput(values) })
          : createEquipment.mutateAsync(toCreateEquipmentInput(values)),
      successMessage: (values) => `Equipo "${values.name}" ${isEdit ? "actualizado" : "creado"}.`,
      errorMessage: isEdit ? "No se pudo actualizar el equipo." : "No se pudo crear el equipo.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar equipo" : "Nuevo equipo"}
      description={
        isEdit
          ? "Actualiza los datos del equipo. El estado lo mueve el flujo de mantenimientos."
          : "Registra un equipo del activo fijo del gimnasio."
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
                : "Crear equipo"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField {...bind("name")} label="Nombre" placeholder="Caminadora Pro 3000" autoFocus />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Categoría"
            htmlFor="equipment-category"
            hint="Opcional."
            error={errors.equipment_category_id?.message}
          >
            <Controller
              control={control}
              name="equipment_category_id"
              render={({ field }) => (
                <Combobox
                  id="equipment-category"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={categorySelectOptions}
                  searchable
                  placeholder="Selecciona una categoría"
                  searchPlaceholder="Buscar categoría…"
                  emptyText="Sin categorías."
                  aria-invalid={errors.equipment_category_id ? true : undefined}
                />
              )}
            />
          </Field>

          <Field label="Sede" htmlFor="equipment-branch" error={errors.branch_id?.message}>
            <Controller
              control={control}
              name="branch_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="equipment-branch"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={branchOptions}
                  selectedOption={branchSelected}
                  placeholder="Selecciona una sede"
                  searchPlaceholder="Buscar sede…"
                  emptyText="Sin sedes."
                  aria-invalid={errors.branch_id ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField {...bind("brand")} label="Marca" hint="Opcional." placeholder="LifeFitness" />
          <TextField {...bind("model")} label="Modelo" hint="Opcional." placeholder="T5" />
        </div>

        <TextField
          {...bind("serial_number")}
          label="Número de serie"
          hint="Opcional."
          placeholder="LF-T5-0001"
        />

        <div className="grid grid-cols-2 gap-4">
          <DateField
            form={form}
            name="purchase_date"
            idPrefix="equipment"
            label="Fecha de compra"
            hint="Opcional."
          />
          <TextField
            {...bind("purchase_cost")}
            label="Costo de compra"
            hint="Opcional."
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="4500.00"
          />
        </div>

        <DateField
          form={form}
          name="warranty_expiration"
          idPrefix="equipment"
          label="Vencimiento de garantía"
          hint="Opcional."
        />
      </form>
    </AppDialog>
  );
}
