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

/**
 * Por ahora el gimnasio cobra solo en soles: los pagos y la caja no guardan
 * moneda. Para internacionalizar, agregar códigos aquí y en la API
 * (`StoreMembershipPlanRequest::CURRENCIES`) además de la moneda en pagos.
 */
export const MEMBERSHIP_PLAN_CURRENCIES: readonly string[] = ["PEN"];

/** Topes del plan (mismos que `StoreMembershipPlanRequest` en la API). */
export const MEMBERSHIP_PLAN_MAX_PRICE = 99999.99;
export const MEMBERSHIP_PLAN_MAX_DURATION_DAYS = 730;
