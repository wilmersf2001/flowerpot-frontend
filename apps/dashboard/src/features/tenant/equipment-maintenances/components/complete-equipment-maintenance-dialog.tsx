"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import {
  AppDialog,
  DateField,
  Field,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import {
  EQUIPMENT_MAINTENANCE_PAYMENT_METHODS,
  EQUIPMENT_MAINTENANCE_PAYMENT_METHOD_LABELS,
} from "../lib/equipment-maintenances.constants";
import { useCompleteEquipmentMaintenance } from "../lib/equipment-maintenances.hooks";
import {
  COMPLETE_EQUIPMENT_MAINTENANCE_FORM_FIELDS,
  completeEquipmentMaintenanceFormDefaults,
  completeEquipmentMaintenanceFormSchema,
  toCompleteEquipmentMaintenanceInput,
  type CompleteEquipmentMaintenanceForm,
} from "../lib/equipment-maintenances.schema";
import type { EquipmentMaintenanceRow } from "../lib/equipment-maintenances.types";

const FORM_ID = "complete-equipment-maintenance-form";

const PAYMENT_METHOD_OPTIONS: ComboboxOption[] = EQUIPMENT_MAINTENANCE_PAYMENT_METHODS.map(
  (method) => ({ value: method, label: EQUIPMENT_MAINTENANCE_PAYMENT_METHOD_LABELS[method] }),
);

/**
 * Diálogo para completar un mantenimiento `en_progreso` (`PATCH .../complete`).
 * Pide el costo (obligatorio) y, opcionalmente, la fecha del próximo
 * mantenimiento sugerido. Devuelve el equipo a `operativo`.
 */
export function CompleteEquipmentMaintenanceDialog({
  maintenance,
  onOpenChangeAction,
}: {
  maintenance: EquipmentMaintenanceRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const open = maintenance !== null;
  const completeMaintenance = useCompleteEquipmentMaintenance();

  const form = useForm<CompleteEquipmentMaintenanceForm>({
    resolver: zodResolver(completeEquipmentMaintenanceFormSchema),
    defaultValues: completeEquipmentMaintenanceFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "complete-equipment-maintenance");

  useEffect(() => {
    if (open) reset(completeEquipmentMaintenanceFormDefaults);
  }, [open, maintenance, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<CompleteEquipmentMaintenanceForm, EquipmentMaintenanceRow>({
      form,
      fields: COMPLETE_EQUIPMENT_MAINTENANCE_FORM_FIELDS,
      submit: (values) => {
        if (!maintenance) throw new Error("No hay mantenimiento seleccionado.");
        return completeMaintenance.mutateAsync({
          id: maintenance.id,
          input: toCompleteEquipmentMaintenanceInput(values),
        });
      },
      successMessage: () => "Mantenimiento completado. El equipo volvió a operativo.",
      errorMessage: "No se pudo completar el mantenimiento.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChangeAction}
      className="max-w-sm"
      title="Completar mantenimiento"
      description={
        maintenance?.equipment
          ? `Registra el costo final del mantenimiento de "${maintenance.equipment.name}".`
          : "Registra el costo final del mantenimiento."
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
            {isSubmitting ? "Guardando…" : "Completar"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          {...bind("cost")}
          label="Costo"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="350.00"
          autoFocus
        />
        <Field
          label="Método de pago"
          htmlFor="complete-equipment-maintenance-payment-method"
          error={errors.payment_method?.message}
          hint="En efectivo se registra un egreso en la caja abierta."
        >
          <Controller
            control={control}
            name="payment_method"
            render={({ field }) => (
              <Combobox
                id="complete-equipment-maintenance-payment-method"
                value={field.value}
                onValueChange={field.onChange}
                options={PAYMENT_METHOD_OPTIONS}
                aria-invalid={errors.payment_method ? true : undefined}
              />
            )}
          />
        </Field>
        <DateField
          form={form}
          name="next_maintenance_date"
          idPrefix="complete-equipment-maintenance"
          label="Próximo mantenimiento sugerido"
          hint="Opcional. Solo informativo, no agenda nada automáticamente."
        />
      </form>
    </AppDialog>
  );
}
