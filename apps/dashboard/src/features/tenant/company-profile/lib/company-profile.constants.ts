export const COMPANY_PROFILE_ENDPOINT = "/company-profile";

/** Permisos del catálogo (el backend los re-valida en cada request). */
export const COMPANY_PROFILE_VIEW_PERMISSION = "settings.view";
export const COMPANY_PROFILE_EDIT_PERMISSION = "settings.edit_branding";

/** Mismo regex que `UpdateCompanyProfileRequest`: `#RRGGBB`. */
export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** Dompdf solo renderiza PNG/JPG de forma fiable; tope de 1 MB (backend). */
export const IMAGE_ACCEPT = "image/png,image/jpeg";
export const IMAGE_ACCEPTED_TYPES: readonly string[] = [
  "image/png",
  "image/jpeg",
];
export const IMAGE_MAX_BYTES = 1024 * 1024;

export const COMPANY_IMAGE_TYPES = [
  "logo",
  "logo_alt",
  "signature",
  "stamp",
] as const;

/** Textos de cada imagen de marca, en el orden en que se muestran. */
export const COMPANY_IMAGE_META = {
  logo: {
    label: "Logo principal",
    hint: "Aparece en el encabezado de los documentos.",
  },
  logo_alt: {
    label: "Logo alternativo",
    hint: "Versión secundaria, por ejemplo para fondos oscuros.",
  },
  signature: {
    label: "Firma",
    hint: "Firma del representante legal en los contratos.",
  },
  stamp: {
    label: "Sello",
    hint: "Sello de la empresa en contratos y recibos.",
  },
} as const;
