import { boundedText, numericText } from "@/features/_shared/form-schema";
import z from "zod";
import type { GymSettingsRow, UpdateGymSettingsInput } from "./gym-settings.types";

export const gymSettingsFormSchema = z.object({
  culqi_enabled: z.boolean(),
  culqi_public_key: boundedText("La llave pública de Culqi", { max: 250 }),
  culqi_secret_key: boundedText("La llave secreta de Culqi", { max: 250 }),
  culqi_fee_rate: numericText("La comisión de Culqi", { min: 0, max: 100 }),
  timezone: boundedText("La zona horaria", { max: 250 }),
  currency: z
    .string()
    .trim()
    .length(3, "Usa el código ISO de 3 letras (p. ej. PEN).")
    .transform((value) => value.toUpperCase()),
});

export type GymSettingsForm = z.infer<typeof gymSettingsFormSchema>;

export const gymSettingsFormDefaults: GymSettingsForm = {
  culqi_enabled: false,
  culqi_public_key: "",
  culqi_secret_key: "",
  culqi_fee_rate: "0",
  timezone: "",
  currency: "PEN",
};

/** Campos que el backend puede devolver como error de validación. */
export const GYM_SETTINGS_FORM_FIELDS = [
  "culqi_enabled",
  "culqi_public_key",
  "culqi_secret_key",
  "culqi_fee_rate",
  "timezone",
  "currency",
] as const satisfies readonly (keyof GymSettingsForm)[];

/** Prellena el formulario con la configuración existente de un gimnasio. */
export function gymSettingsToForm(row: GymSettingsRow): GymSettingsForm {
  return {
    culqi_enabled: Boolean(row.culqi_enabled),
    culqi_public_key: row.culqi_public_key ?? "",
    culqi_secret_key: row.culqi_secret_key ?? "",
    culqi_fee_rate: String(row.culqi_fee_rate ?? 0),
    timezone: row.timezone ?? "",
    currency: row.currency ?? "PEN",
  };
}

/** Convierte el formulario validado al cuerpo de `PUT /gym-settings/{id}`. */
export function toUpdateGymSettingsInput(
  form: GymSettingsForm,
): UpdateGymSettingsInput {
  return {
    culqi_enabled: form.culqi_enabled,
    culqi_public_key: form.culqi_public_key,
    culqi_secret_key: form.culqi_secret_key,
    culqi_fee_rate: Number(form.culqi_fee_rate),
    timezone: form.timezone,
    currency: form.currency,
  };
}
