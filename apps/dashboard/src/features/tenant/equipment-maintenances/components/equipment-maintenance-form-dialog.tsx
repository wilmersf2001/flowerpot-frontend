"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  AsyncCombobox,
  DateField,
  Field,
  TextareaField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useEquipmentOptions } from "@/features/tenant/equipment";
import { useSupplierOptions } from "@/features/tenant/suppliers";
import {
  useCreateEquipmentMaintenance,
  useUpdateEquipmentMaintenance,
} from "../lib/equipment-maintenances.hooks";
import {
  EQUIPMENT_MAINTENANCE_FORM_FIELDS,
  equipmentMaintenanceFormDefaults,
  equipmentMaintenanceFormSchema,
  equipmentMaintenanceToForm,
  toCreateEquipmentMaintenanceInput,
  toUpdateEquipmentMaintenanceInput,
  type EquipmentMaintenanceForm,
} from "../lib/equipment-maintenances.schema";
import type { EquipmentMaintenanceRow } from "../lib/equipment-maintenances.types";

const FORM_ID = "equipment-maintenance-form";

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "preventivo", label: "Preventivo" },
  { value: "correctivo", label: "Correctivo" },
];

/**
 * Diálogo de mantenimiento. Sin `maintenance` es "Nuevo mantenimiento"
 * (POST); con `maintenance` es "Editar" (PATCH, solo si está `programado` —
 * el padre no ofrece editar otro estado). En edición, `equipment_id` y `type`
 * quedan fijos: el backend no los acepta en `PATCH`.
 */
export function EquipmentMaintenanceFormDialog({
  open,
  maintenance = null,
  onOpenChangeAction,
}: {
  open: boolean;
  maintenance?: EquipmentMaintenanceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const isEdit = maintenance !== null;
  const createMaintenance = useCreateEquipmentMaintenance();
  const updateMaintenance = useUpdateEquipmentMaintenance();
  const equipmentOptions = useEquipmentOptions(open);
  const supplierOptions = useSupplierOptions(open);

  const form = useForm<EquipmentMaintenanceForm>({
    resolver: zodResolver(equipmentMaintenanceFormSchema),
    defaultValues: equipmentMaintenanceFormDefaults,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "equipment-maintenance");
  const type = useWatch({ control, name: "type" });

  useEffect(() => {
    if (open) {
      reset(maintenance ? equipmentMaintenanceToForm(maintenance) : equipmentMaintenanceFormDefaults);
    }
  }, [open, maintenance, reset]);

  const equipmentSelected: ComboboxOption | null = maintenance?.equipment
    ? { value: maintenance.equipment.id, label: maintenance.equipment.name }
    : null;
  const supplierSelected: ComboboxOption | null = maintenance?.supplier
    ? { value: maintenance.supplier.id, label: maintenance.supplier.name }
    : null;

  const onSubmit = handleSubmit(
    useResourceFormSubmit<EquipmentMaintenanceForm, EquipmentMaintenanceRow>({
      form,
      fields: EQUIPMENT_MAINTENANCE_FORM_FIELDS,
      submit: (values) =>
        maintenance
          ? updateMaintenance.mutateAsync({
              id: maintenance.id,
              input: toUpdateEquipmentMaintenanceInput(values),
            })
          : createMaintenance.mutateAsync(toCreateEquipmentMaintenanceInput(values)),
      successMessage: () => (isEdit ? "Mantenimiento actualizado." : "Mantenimiento creado."),
      errorMessage: isEdit
        ? "No se pudo actualizar el mantenimiento."
        : "No se pudo crear el mantenimiento.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title={isEdit ? "Editar mantenimiento" : "Nuevo mantenimiento"}
      description={
        isEdit
          ? "Solo puedes editar mantenimientos programados."
          : "Un correctivo pone el equipo en mantenimiento de inmediato."
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
                : "Crear mantenimiento"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Equipo" htmlFor="equipment-maintenance-equipment" error={errors.equipment_id?.message}>
            <Controller
              control={control}
              name="equipment_id"
              render={({ field }) => (
                <AsyncCombobox
                  id="equipment-maintenance-equipment"
                  value={field.value}
                  onValueChange={field.onChange}
                  source={equipmentOptions}
                  selectedOption={equipmentSelected}
                  disabled={isEdit}
                  placeholder="Selecciona un equipo"
                  searchPlaceholder="Buscar equipo…"
                  emptyText="Sin equipos."
                  aria-invalid={errors.equipment_id ? true : undefined}
                />
              )}
            />
          </Field>

          <Field label="Tipo" htmlFor="equipment-maintenance-type" error={errors.type?.message}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Combobox
                  id="equipment-maintenance-type"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={TYPE_OPTIONS}
                  disabled={isEdit}
                  placeholder="Selecciona un tipo"
                  aria-invalid={errors.type ? true : undefined}
                />
              )}
            />
          </Field>
        </div>

        <Field label="Proveedor" htmlFor="equipment-maintenance-supplier" error={errors.supplier_id?.message}>
          <Controller
            control={control}
            name="supplier_id"
            render={({ field }) => (
              <AsyncCombobox
                id="equipment-maintenance-supplier"
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

        <TextareaField
          {...bind("description")}
          label="Descripción"
          placeholder="Lubricación y calibración de banda"
        />

        <DateField
          form={form}
          name="scheduled_date"
          idPrefix="equipment-maintenance"
          label="Fecha programada"
          hint={type === "correctivo" ? "Opcional para correctivos." : "Obligatoria para preventivos."}
        />
      </form>
    </AppDialog>
  );
}
