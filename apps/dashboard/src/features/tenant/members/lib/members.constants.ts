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
