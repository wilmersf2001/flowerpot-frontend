/** Ruta del recurso en la API (el `apiClient` le antepone `/api/proxy`). */
export const MEMBERSHIP_PLANS_ENDPOINT = "/membership-plans";

/** Tamaño de página por defecto del list de planes de membresía. */
export const MEMBERSHIP_PLANS_PER_PAGE = 100;

/** Modos de acceso a sedes del plan (`branch_access` en el backend). */
export const BRANCH_ACCESS_MODES = ["all", "specific", "limited"] as const;

export type BranchAccess = (typeof BRANCH_ACCESS_MODES)[number];

export const BRANCH_ACCESS_OPTIONS = [
  { value: "all", label: "Todas las sedes", hint: "Incluye las que se creen después." },
  { value: "specific", label: "Sedes específicas", hint: "Solo las sedes que asignes al plan." },
  { value: "limited", label: "Limitado", hint: "El cliente elige hasta N sedes." },
];
