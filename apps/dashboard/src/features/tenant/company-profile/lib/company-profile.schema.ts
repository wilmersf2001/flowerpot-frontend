import { z } from "zod";
import { optionalText } from "@/features/_shared/form-schema";
import { HEX_COLOR_PATTERN } from "./company-profile.constants";
import type {
  CompanyProfile,
  UpdateCompanyProfileInput,
} from "./company-profile.types";

const hexColor = (label: string) =>
  z
    .string()
    .trim()
    .regex(
      HEX_COLOR_PATTERN,
      `${label} debe tener formato hexadecimal (#RRGGBB).`,
    );

export const companyProfileFormSchema = z.object({
  legal_name: optionalText(255),
  trade_name: optionalText(255),
  ruc: optionalText(20),
  address: optionalText(255),
  phone: optionalText(30),
  email: z
    .string()
    .trim()
    .max(255, "Máximo 255 caracteres.")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Ingresa un correo válido.",
    ),
  legal_rep_name: optionalText(255),
  legal_rep_dni: optionalText(20),
  primary_color: hexColor("El color primario"),
  secondary_color: hexColor("El color secundario"),
  document_layout: z.string().min(1, "Selecciona un formato de documento."),
});

export type CompanyProfileForm = z.infer<typeof companyProfileFormSchema>;

/** Campos que el backend puede devolver como error de validación. */
export const COMPANY_PROFILE_FORM_FIELDS = [
  "legal_name",
  "trade_name",
  "ruc",
  "address",
  "phone",
  "email",
  "legal_rep_name",
  "legal_rep_dni",
  "primary_color",
  "secondary_color",
  "document_layout",
] as const satisfies readonly (keyof CompanyProfileForm)[];

/** Prellena el formulario con el perfil actual. */
export function companyProfileToForm(
  profile: CompanyProfile,
): CompanyProfileForm {
  return {
    legal_name: profile.legal_name ?? "",
    trade_name: profile.trade_name ?? "",
    ruc: profile.ruc ?? "",
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    legal_rep_name: profile.legal_rep_name ?? "",
    legal_rep_dni: profile.legal_rep_dni ?? "",
    primary_color: profile.primary_color,
    secondary_color: profile.secondary_color,
    document_layout: profile.document_layout,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /company-profile`. */
export function toUpdateCompanyProfileInput(
  form: CompanyProfileForm,
): UpdateCompanyProfileInput {
  return {
    legal_name: form.legal_name || null,
    trade_name: form.trade_name || null,
    ruc: form.ruc || null,
    address: form.address || null,
    phone: form.phone || null,
    email: form.email || null,
    legal_rep_name: form.legal_rep_name || null,
    legal_rep_dni: form.legal_rep_dni || null,
    primary_color: form.primary_color,
    secondary_color: form.secondary_color,
    document_layout: form.document_layout,
  };
}
