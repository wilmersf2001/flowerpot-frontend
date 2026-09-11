"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import {
  AppDialog,
  TextField,
  useFieldBinder,
  useResourceFormSubmit,
} from "@/features/_shared";
import { useUpdateGymSettings } from "../lib/gym-settings.hook";
import type { GymSettingsRow } from "../lib/gym-settings.types";
import {
  GYM_SETTINGS_FORM_FIELDS,
  gymSettingsFormDefaults,
  gymSettingsFormSchema,
  gymSettingsToForm,
  toUpdateGymSettingsInput,
  type GymSettingsForm,
} from "../lib/gym-settings.schema";

const FORM_ID = "gym-settings-form";

/**
 * Diálogo "Editar configuración". El padre pasa la fila a editar (o `null`
 * para cerrar) — no hay modo alta, la configuración se crea del lado del
 * backend junto con el gimnasio.
 */
export function GymSettingsFormDialog({
  gymSettings,
  onOpenChangeAction,
}: {
  gymSettings: GymSettingsRow | null;
  onOpenChangeAction: (open: boolean) => void;
}) {
  const updateGymSettings = useUpdateGymSettings();

  const form = useForm<GymSettingsForm>({
    resolver: zodResolver(gymSettingsFormSchema),
    defaultValues: gymSettingsFormDefaults,
  });
  const {
    handleSubmit,
    reset,
    register,
    formState: { isSubmitting },
  } = form;
  const bind = useFieldBinder(form, "gym-settings");

  // Cada vez que se abre, sincroniza el formulario con la fila seleccionada.
  useEffect(() => {
    if (gymSettings) reset(gymSettingsToForm(gymSettings));
  }, [gymSettings, reset]);

  const onSubmit = handleSubmit(
    useResourceFormSubmit<GymSettingsForm, GymSettingsRow>({
      form,
      fields: GYM_SETTINGS_FORM_FIELDS,
      submit: (values) =>
        updateGymSettings.mutateAsync({
          id: gymSettings!.id,
          input: toUpdateGymSettingsInput(values),
        }),
      successMessage: () => `Configuración de "${gymSettings?.tenant_id}" actualizada.`,
      errorMessage: "No se pudo actualizar la configuración.",
      onSuccess: () => onOpenChangeAction(false),
    }),
  );

  return (
    <AppDialog
      open={gymSettings !== null}
      onOpenChange={onOpenChangeAction}
      className="max-w-lg"
      title="Editar configuración"
      description={`Configuración de pagos y regional de "${gymSettings?.tenant_id ?? ""}".`}
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
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            {...register("culqi_enabled")}
          />
          Culqi habilitado
        </label>

        <TextField
          {...bind("culqi_public_key")}
          label="Llave pública de Culqi"
          placeholder="pk_live_…"
          autoFocus
        />

        <TextField
          {...bind("culqi_secret_key")}
          label="Llave secreta de Culqi"
          placeholder="sk_live_…"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            {...bind("culqi_fee_rate")}
            label="Comisión de Culqi (%)"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            placeholder="3.5"
          />

          <TextField
            {...bind("currency")}
            label="Moneda"
            placeholder="PEN"
            maxLength={3}
            className="uppercase"
          />
        </div>

        <TextField
          {...bind("timezone")}
          label="Zona horaria"
          placeholder="America/Lima"
        />
      </form>
    </AppDialog>
  );
}
