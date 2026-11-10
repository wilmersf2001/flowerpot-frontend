/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const MEMBERS_ENDPOINT = "/members";

/** Tamaño de página del listado de socios. */
export const MEMBERS_PER_PAGE = 10;

export const MEMBER_GENDERS = ["male", "female", "other"] as const;
export const MEMBER_GENDER_LABELS: Record<
  (typeof MEMBER_GENDERS)[number],
  string
> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

/** Cómo conoció el socio al gimnasio (`members.source`, para analytics). */
export const MEMBER_SOURCES = [
  "web",
  "referral",
  "social_media",
  "walk_in",
  "promotion",
  "other",
] as const;

export const MEMBER_SOURCE_LABELS: Record<
  (typeof MEMBER_SOURCES)[number],
  string
> = {
  web: "Página web",
  referral: "Referido",
  social_media: "Redes sociales",
  walk_in: "Llegó al gimnasio",
  promotion: "Promoción",
  other: "Otro",
};

/** Edad permitida para inscribir a un socio (mismo rango que valida la API). */
export const MEMBER_MIN_AGE = 18;
export const MEMBER_MAX_AGE = 100;
